-- Sample data for development and demos. All names and numbers are fictional.
-- Password for every account: tanihias123 (stored as a bcrypt hash).
-- DELETE these accounts or change their passwords before UAT with real users.
-- Display data (names, product names, descriptions) stays in Indonesian
-- because it is shown in the UI.

-- ---------------------------------------------------------------------
-- Accounts (auth.users). The on_auth_user_created trigger creates the
-- users row and, for farmers, the business_profiles row.
-- ---------------------------------------------------------------------
with accounts (id, email, name, role, created) as (
  values
    ('a0000000-0000-4000-8000-000000000001'::uuid, 'admin@tanihias.id',   'Admin Tanihias',  'buyer',  '2026-09-20 08:00+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000002'::uuid, 'ujang@tanihias.id',   'Ujang Suryana',   'farmer', '2026-09-22 09:15+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000003'::uuid, 'sari@tanihias.id',    'Sari Endah',      'farmer', '2026-09-24 10:30+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000004'::uuid, 'euis@tanihias.id',    'Euis Rahmawati',  'farmer', '2026-09-27 14:00+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000005'::uuid, 'dadang@tanihias.id',  'Dadang Hermawan', 'farmer', '2026-10-01 07:45+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000006'::uuid, 'pembeli@tanihias.id', 'Rina Kusuma',     'buyer',  '2026-10-03 19:20+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000007'::uuid, 'bima@contoh.id',      'Bima Prasetyo',   'buyer',  '2026-10-09 21:05+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000008'::uuid, 'tono@contoh.id',      'Tono Spam',       'buyer',  '2026-10-12 11:11+07'::timestamptz)
)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
)
select
  '00000000-0000-0000-0000-000000000000', id, 'authenticated', 'authenticated', email,
  extensions.crypt('tanihias123', extensions.gen_salt('bf')), created,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  jsonb_build_object('name', name, 'role', role), created, created,
  '', '', '', '', '', '', '', ''
from accounts;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select
  gen_random_uuid(), u.id, u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email', u.created_at, u.created_at, u.created_at
from auth.users u
where u.id::text like 'a0000000-0000-4000-8000-%';

update public.users p
set created_at = u.created_at
from auth.users u
where u.id = p.id and u.id::text like 'a0000000-0000-4000-8000-%';

-- The admin role and the blocked status can only be set through SQL/admin
update public.users set role = 'admin' where id = 'a0000000-0000-4000-8000-000000000001';
update public.users set status = 'blocked' where id = 'a0000000-0000-4000-8000-000000000008';

-- ---------------------------------------------------------------------
-- Farmer business profiles
-- ---------------------------------------------------------------------
update public.business_profiles b
set business_name = v.business_name, location = v.location, whatsapp_number = v.whatsapp_number
from (
  values
    ('a0000000-0000-4000-8000-000000000002'::uuid, 'Kebun Krisan Mang Ujang', 'Kp. Cihideung Hilir, Parongpong', '081200000101'),
    ('a0000000-0000-4000-8000-000000000003'::uuid, 'Anggrek Sari Endah',      'Kp. Pasirwangi, Cihideung',       '081200000102'),
    ('a0000000-0000-4000-8000-000000000004'::uuid, 'Saung Daun Bu Euis',      'Jl. Kolonel Masturi, Cihideung',  '081200000103'),
    ('a0000000-0000-4000-8000-000000000005'::uuid, 'Kebun Pakis Abah Dadang', 'Kp. Panyairan, Cihideung',        '081200000104')
) as v (user_id, business_name, location, whatsapp_number)
where b.user_id = v.user_id;

-- ---------------------------------------------------------------------
-- Products (no photos yet; the app shows an illustration per plant type)
-- ---------------------------------------------------------------------
insert into public.products (business_id, plant_type_id, name, description, min_price, max_price, is_available, created_at)
select b.id, t.id, v.name, v.description, v.min_price, v.max_price, v.is_available, v.created_at
from (
  values
    ('a0000000-0000-4000-8000-000000000002'::uuid, 'Bunga potong', 'Krisan potong kuning',
     'Krisan spray kuning dipanen pagi hari, satu ikat isi 10 tangkai dengan tinggi sekitar 70 cm. Tahan 7–10 hari di vas bila air diganti dua hari sekali dan ujung tangkai dipotong miring.',
     15000, 25000, true, '2026-10-28 06:30+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000002'::uuid, 'Bunga potong', 'Krisan potong putih',
     'Krisan standar putih bunga besar, cocok untuk rangkaian dan dekorasi acara. Satu ikat isi 10 tangkai. Bisa pesan dalam jumlah banyak, kabari dulu dua hari sebelumnya.',
     18000, 30000, true, '2026-10-21 06:10+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000002'::uuid, 'Bunga potong', 'Mawar merah potong',
     'Mawar merah tangkai panjang (50–60 cm), satu ikat isi 10 tangkai. Kuncup dipetik setengah mekar supaya awet saat dikirim.',
     30000, 50000, false, '2026-10-12 07:00+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000003'::uuid, 'Anggrek', 'Anggrek bulan putih',
     'Phalaenopsis putih dua cabang dalam pot plastik 12 cm, sudah berbunga. Letakkan di tempat terang tanpa sinar matahari langsung dan siram media seminggu sekali.',
     85000, 150000, true, '2026-10-30 09:00+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000003'::uuid, 'Anggrek', 'Anggrek dendrobium ungu',
     'Dendrobium ungu ukuran remaja, siap berbunga dalam 1–2 bulan. Suka cahaya terang dan sirkulasi udara yang baik. Media pakis cacah.',
     45000, 75000, true, '2026-10-18 10:20+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000003'::uuid, 'Anthurium', 'Anthurium merah',
     'Anthurium andraeanum bunga merah mengilap dalam pot 15 cm. Berbunga sepanjang tahun bila mendapat cahaya terang tidak langsung.',
     60000, 120000, true, '2026-10-25 08:40+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000004'::uuid, 'Anthurium', 'Anthurium jemani',
     'Gelombang cinta daun tebal bergelombang, tinggi tanaman sekitar 40 cm. Harga menyesuaikan ukuran dan jumlah daun, tanyakan foto terbaru lewat WhatsApp.',
     150000, 350000, true, '2026-10-08 13:00+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000004'::uuid, 'Tanaman daun', 'Monstera deliciosa',
     'Monstera daun sudah berjari, tinggi 50–80 cm dalam polybag. Cocok untuk sudut ruang tamu yang terang. Siram saat media bagian atas kering.',
     75000, 200000, true, '2026-10-29 15:30+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000004'::uuid, 'Tanaman daun', 'Calathea orbifolia',
     'Daun lebar bergaris perak. Butuh kelembapan tinggi, jauhkan dari AC dan sinar matahari langsung. Pot 15 cm.',
     65000, 110000, true, '2026-10-15 11:00+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000004'::uuid, 'Tanaman daun', 'Aglaonema red lipstick',
     'Sri rejeki daun hijau dengan tepi merah, 5–7 daun per pot. Tahan di dalam ruangan dengan cahaya sedang.',
     50000, 90000, true, '2026-10-05 09:45+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000004'::uuid, 'Tanaman daun', 'Sansevieria lidah mertua',
     'Lidah mertua tinggi 40–60 cm, sangat tahan banting dan jarang disiram. Pilihan aman untuk pemula dan kantor.',
     35000, 70000, true, '2026-09-30 10:00+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000005'::uuid, 'Pakis', 'Pakis boston gantung',
     'Nephrolepis lebat dalam pot gantung diameter 25 cm. Suka tempat lembap dan teduh, siram setiap hari saat kemarau.',
     25000, 45000, true, '2026-10-27 07:15+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000005'::uuid, 'Pakis', 'Suplir',
     'Adiantum daun halus dalam pot 12 cm. Media harus selalu lembap tetapi tidak becek.',
     20000, 35000, true, '2026-10-10 08:00+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000005'::uuid, 'Pakis', 'Pakis tanduk rusa',
     'Platycerium ditempel pada papan kayu, siap digantung di dinding teras. Semprot air dua kali seminggu.',
     90000, 175000, false, '2026-10-02 09:30+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000005'::uuid, 'Kaktus & sukulen', 'Kaktus mini campur',
     'Paket kaktus mini dalam pot 5,5 cm, jenis acak. Cocok untuk meja kerja dan suvenir. Siram seminggu sekali.',
     10000, 20000, true, '2026-10-22 14:10+07'::timestamptz),
    ('a0000000-0000-4000-8000-000000000003'::uuid, 'Kaktus & sukulen', 'Sukulen echeveria',
     'Echeveria roset warna hijau keabu-abuan, diameter 6–8 cm. Butuh matahari pagi dan media porous.',
     15000, 30000, true, '2026-10-19 16:00+07'::timestamptz)
) as v (user_id, plant_type_name, name, description, min_price, max_price, is_available, created_at)
join public.business_profiles b on b.user_id = v.user_id
join public.plant_types t on t.name = v.plant_type_name;
