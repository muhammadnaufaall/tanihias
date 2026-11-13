# Tanihias

An ornamental plant marketplace that connects buyers directly with farmers in Cihideung Village, West Bandung Regency. Capstone Project STSI4440, Group C, Universitas Terbuka.

Stack: Next.js 16 (frontend + backend), Supabase (PostgreSQL, Auth, Storage), deployment planned on Vercel.

**Language convention:** code, comments, file names, routes, and the database schema are in English. Everything users see (UI text, validation messages, sample data) stays in Indonesian, because the users are Indonesian and the test scenarios in the report (U01–U15) refer to that text.

## Running

This project uses **pnpm** (the version is pinned in `packageManager` in `package.json`). Do not use npm or yarn, so there is only one lockfile, `pnpm-lock.yaml`.

1. Copy `.env.example` to `.env.local`, then fill it in from the group's Supabase project (ask the member who owns the project).
2. Run:

   ```bash
   pnpm install
   pnpm dev
   ```

3. Open http://localhost:3000.

Adding a shadcn/ui component: `pnpm dlx shadcn@latest add <name>`.

### Sample accounts (from `supabase/seed.sql`)

Password for every account: `tanihias123`. This list is also shown on `/login` during `pnpm dev`.

| Role   | Email                 |
| ------ | --------------------- |
| Buyer  | `pembeli@tanihias.id` |
| Farmer | `ujang@tanihias.id`   |
| Admin  | `admin@tanihias.id`   |

Other farmer accounts: `sari@`, `euis@`, `dadang@tanihias.id`. The `tono@contoh.id` account is intentionally blocked.

**Before UAT with real users**, delete the sample accounts or change their passwords (especially the admin), because the password is written in this repo.

## Setting up Supabase (once per project)

1. Create a project at https://supabase.com/dashboard.
2. **Authentication → Sign In / Providers → Email**: turn off **Confirm email** and set **Minimum password length** to 8.
3. Fill in `.env.local` (see the notes in `.env.example`).
4. Run the migration and the sample data:

   ```bash
   set -a; source .env.local; set +a
   pnpm dlx supabase db push --remote="$SUPABASE_DB_URL" --include-seed
   ```

   Without the CLI: open the **SQL Editor**, run `supabase/migrations/20261103000000_tanihias_schema.sql`, then `supabase/seed.sql`.

If the database password contains characters such as `@`, `#`, or `/`, URL-encode them in `SUPABASE_DB_URL`.

### Making an account an admin

Admins cannot be created through the sign-up page. Sign up as usual, then run this in the SQL Editor:

```sql
update public.users set role = 'admin' where email = 'email@example.com';
```

## Database

The schema lives in [`supabase/migrations`](supabase/migrations) and follows the ERD (Figure 3.6):

| Table / view               | ERD entity    | Contents                                                                      |
| -------------------------- | ------------- | ----------------------------------------------------------------------------- |
| `users`                    | Pengguna      | Account profile (name, email, role, status). Passwords are in `auth.users` as bcrypt hashes. |
| `business_profiles`        | Profil Usaha  | Farmer's business name, location, WhatsApp number                             |
| `plant_types`              | Jenis Tanaman | Plant categories                                                              |
| `products`                 | Produk        | Products with a price range and availability                                  |
| `product_photos`           | Foto Produk   | Photo paths in the `product-photos` Storage bucket (max 3 photos, 2 MB, JPG/PNG) |
| `listed_products` (view)   | -             | Public catalog: products from farmers who are not blocked, used by search (Table 3.5) |
| `plant_type_summary` (view)| -             | Plant types with their number of listed products                              |

Stored values: `role` is `buyer`, `farmer`, or `admin`; `status` is `active` or `blocked`.

Access is enforced by Row Level Security in the database, not only in the app:

- Visitors who are not signed in can browse the catalog but **cannot read WhatsApp numbers**.
- Farmers can only change their own business profile, products, and photos (U10).
- Admins can block non-admin users, delete accounts through the `delete_user` function, manage plant types, and take products down.
- People signing up cannot choose the admin role; the `on_auth_user_created` trigger only accepts buyer or farmer.

There is no `messages` table because conversations happen over WhatsApp links, per the system's scope.

## Pages

| URL                           | Contents                                  | Wireframe | Access         |
| ----------------------------- | ----------------------------------------- | --------- | -------------- |
| `/`                           | Home: search, plant types, latest products | 3.13      | Public         |
| `/catalog`                    | Catalog, search, filters, sorting         | 3.9       | Public         |
| `/products/[id]`              | Product detail + WhatsApp button; the owning farmer also sees a "Tampilan pembeli" preview bar | 3.10 | Signed in |
| `/login`, `/register`         | Sign in and sign up                       | 3.7       | Public         |
| `/farmer`                     | My products                               | 3.11      | Farmer         |
| `/farmer/products/new`        | Add product                               | 3.12      | Farmer         |
| `/farmer/products/[id]/edit`  | Edit product                              | 3.12      | Owning farmer  |
| `/farmer/profile`             | Business profile                          | -         | Farmer         |
| `/admin`                      | Overview                                  | 3.8       | Admin          |
| `/admin/users`                | Block and delete users                    | -         | Admin          |
| `/admin/plant-types`          | Manage plant types                        | -         | Admin          |
| `/admin/products`             | Product monitoring and take-down          | -         | Admin          |

Catalog query parameters: `q` (keyword), `type` (plant type id, repeatable), `min`, `max`, `sort` (`newest`, `price_asc`, `price_desc`), `page`.

Wireframes 3.8 and 3.13 are swapped in the report: 3.13 is used for the public home page and 3.8 for the admin dashboard.

## Structure

```
src/
  app/                 pages (App Router)
  actions/             Server Actions: auth, farmer (products + photo upload), admin
  components/          components; components/ui holds shadcn/ui
  lib/data/index.ts    Supabase queries, including the search algorithm from Table 3.5
  lib/supabase/        Supabase client for the server
  lib/session.ts       reads the signed-in user
  lib/validation.ts    validation rules matching the test scenarios in Table 3.7
  proxy.ts             refreshes the Supabase session + per-role login gate
supabase/
  migrations/          schema, RLS, trigger, views, Storage bucket
  seed.sql             sample data
```

## Next.js 16 notes

This project uses Next.js 16 with `cacheComponents` enabled. Middleware is now called `proxy.ts`, and anything that reads cookies, `searchParams`, or data must be wrapped in `<Suspense>`. Read `AGENTS.md` and the docs in `node_modules/next/dist/docs/` before adding features.
