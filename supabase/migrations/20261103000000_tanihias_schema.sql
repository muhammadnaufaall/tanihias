create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'buyer' check (role in ('buyer', 'farmer', 'admin')),
  status text not null default 'active' check (status in ('active', 'blocked')),
  created_at timestamptz not null default now()
);

comment on table public.users is 'User profile; the password (bcrypt hash) is stored by Supabase Auth in auth.users.';

create table public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  business_name text not null default '',
  location text not null default '',
  whatsapp_number text not null default ''
);

create table public.plant_types (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 3 and 40)
);

create unique index plant_types_name_unique on public.plant_types (lower(name));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_profiles (id) on delete cascade,
  plant_type_id uuid not null references public.plant_types (id) on delete restrict,
  name text not null check (length(trim(name)) > 0),
  description text not null default '' check (length(description) <= 1000),
  min_price integer not null check (min_price >= 1),
  max_price integer not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  constraint price_range_valid check (max_price >= min_price)
);

create index products_business_id_idx on public.products (business_id);
create index products_plant_type_id_idx on public.products (plant_type_id);
create index products_created_at_idx on public.products (created_at desc);

create table public.product_photos (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  file_path text not null,
  sort_order smallint not null default 0
);

create index product_photos_product_id_idx on public.product_photos (product_id);

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.users
    where id = (select auth.uid()) and role = 'admin' and status = 'active'
  );
$$;

create function public.is_active_farmer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.users
    where id = (select auth.uid()) and role = 'farmer' and status = 'active'
  );
$$;

create function public.is_business_active(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_profiles b
    join public.users u on u.id = b.user_id
    where b.id = p_business_id and u.status = 'active'
  );
$$;

create function public.owns_business(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_profiles b
    join public.users u on u.id = b.user_id
    where b.id = p_business_id
      and b.user_id = (select auth.uid())
      and u.role = 'farmer'
      and u.status = 'active'
  );
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text := case when new.raw_user_meta_data ->> 'role' = 'farmer' then 'farmer' else 'buyer' end;
  v_name text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1));
begin
  insert into public.users (id, name, email, role)
  values (new.id, v_name, new.email, v_role);

  if v_role = 'farmer' then
    insert into public.business_profiles (user_id) values (new.id);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.delete_user(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang boleh menghapus pengguna.' using errcode = '42501';
  end if;
  if exists (select 1 from public.users where id = p_id and role = 'admin') then
    raise exception 'Akun admin tidak bisa dihapus.' using errcode = '42501';
  end if;
  delete from auth.users where id = p_id;
end;
$$;

revoke execute on function public.delete_user(uuid) from public, anon;
grant execute on function public.delete_user(uuid) to authenticated;

alter table public.users enable row level security;
alter table public.business_profiles enable row level security;
alter table public.plant_types enable row level security;
alter table public.products enable row level security;
alter table public.product_photos enable row level security;

create policy "Users see their own row, admins see all"
  on public.users for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "Admins block or unblock users"
  on public.users for update to authenticated
  using ((select public.is_admin()) and role <> 'admin')
  with check (role <> 'admin');

revoke all on public.users from anon;
revoke insert, update, delete on public.users from authenticated;
grant update (status) on public.users to authenticated;

create policy "Active business profiles are visible"
  on public.business_profiles for select to anon, authenticated
  using (
    public.is_business_active(id)
    or user_id = (select auth.uid())
    or (select public.is_admin())
  );

create policy "Farmers update their own business profile"
  on public.business_profiles for update to authenticated
  using (user_id = (select auth.uid()) and (select public.is_active_farmer()))
  with check (user_id = (select auth.uid()));

revoke all on public.business_profiles from anon;
grant select (id, user_id, business_name, location) on public.business_profiles to anon;
revoke insert, update, delete on public.business_profiles from authenticated;
grant update (business_name, location, whatsapp_number) on public.business_profiles to authenticated;

create policy "Plant types are visible to everyone"
  on public.plant_types for select to anon, authenticated
  using (true);

create policy "Admins add plant types"
  on public.plant_types for insert to authenticated
  with check ((select public.is_admin()));

create policy "Admins delete plant types"
  on public.plant_types for delete to authenticated
  using ((select public.is_admin()));

revoke insert, update, delete on public.plant_types from anon;

create policy "Listed products are visible"
  on public.products for select to anon, authenticated
  using (
    public.is_business_active(business_id)
    or public.owns_business(business_id)
    or (select public.is_admin())
  );

create policy "Farmers add products to their business"
  on public.products for insert to authenticated
  with check (public.owns_business(business_id));

create policy "Farmers update their own products"
  on public.products for update to authenticated
  using (public.owns_business(business_id))
  with check (public.owns_business(business_id));

create policy "Farmers delete their products, admins take products down"
  on public.products for delete to authenticated
  using (public.owns_business(business_id) or (select public.is_admin()));

revoke insert, update, delete on public.products from anon;

create policy "Product photos are visible"
  on public.product_photos for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id));

create policy "Farmers add photos to their products"
  on public.product_photos for insert to authenticated
  with check (
    exists (select 1 from public.products p where p.id = product_id and public.owns_business(p.business_id))
  );

create policy "Farmers or admins delete photos"
  on public.product_photos for delete to authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (public.owns_business(p.business_id) or (select public.is_admin()))
    )
  );

revoke insert, update, delete on public.product_photos from anon;
revoke update on public.product_photos from authenticated;

create view public.listed_products
with (security_invoker = true)
as
select
  p.id,
  p.business_id,
  p.plant_type_id,
  p.name,
  p.description,
  p.min_price,
  p.max_price,
  p.is_available,
  p.created_at,
  t.name as plant_type_name,
  b.business_name,
  b.location,
  lower(p.name || ' ' || t.name) as search_text
from public.products p
join public.plant_types t on t.id = p.plant_type_id
join public.business_profiles b on b.id = p.business_id
where public.is_business_active(p.business_id);

create view public.plant_type_summary
with (security_invoker = true)
as
select t.id, t.name, count(l.id)::int as product_count
from public.plant_types t
left join public.listed_products l on l.plant_type_id = t.id
group by t.id, t.name;

revoke all on public.listed_products, public.plant_type_summary from anon, authenticated;
grant select on public.listed_products, public.plant_type_summary to anon, authenticated;

insert into public.plant_types (name) values
  ('Bunga potong'),
  ('Anggrek'),
  ('Anthurium'),
  ('Tanaman daun'),
  ('Pakis'),
  ('Kaktus & sukulen');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-photos', 'product-photos', true, 2097152, array['image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "Product photos are readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-photos');

create policy "Farmers upload photos to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.is_active_farmer())
  );

create policy "Owners or admins delete product photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-photos'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_admin()))
  );
