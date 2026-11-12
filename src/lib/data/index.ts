import type { SupabaseClient } from "@supabase/supabase-js";
import { PHOTO_BUCKET, createClient } from "@/lib/supabase/server";
import type {
  BusinessProfile,
  PlantType,
  Product,
  ProductPhoto,
  ProductSort,
  ProductWithDetails,
  User,
} from "@/lib/types";

// Data access layer (Supabase queries). Every query uses the user's
// session, so Row Level Security in the database applies.

export const PRODUCTS_PER_PAGE = 9;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isValidUuid = (id: string) => UUID_PATTERN.test(id);

function fail(context: string, error: { message: string }): never {
  throw new Error(`Failed to load ${context}: ${error.message}`);
}

/* ---------- Row mapping ---------- */

const LISTED_COLUMNS =
  "id, business_id, plant_type_id, name, description, min_price, max_price, is_available, created_at, plant_type_name, business_name, location";

type ListedRow = Product & { plant_type_name: string; business_name: string; location: string };

type PhotoRow = Omit<ProductPhoto, "url">;

// A product from the products table with its relations (farmer and admin dashboards)
const PRODUCT_RELATION_COLUMNS =
  "*, plant_types (id, name), business_profiles (id, business_name, location), product_photos (id, product_id, file_path, sort_order)";

type ProductRelationRow = Product & {
  plant_types: PlantType;
  business_profiles: Pick<BusinessProfile, "id" | "business_name" | "location">;
  product_photos: PhotoRow[];
};

function withPhotoUrl(supabase: SupabaseClient, photo: PhotoRow): ProductPhoto {
  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(photo.file_path);
  return { ...photo, url: data.publicUrl };
}

function fromRelationRow(supabase: SupabaseClient, row: ProductRelationRow): ProductWithDetails {
  const { plant_types, business_profiles, product_photos, ...product } = row;
  return {
    ...product,
    plantType: plant_types,
    business: business_profiles,
    photos: [...product_photos].sort((a, b) => a.sort_order - b.sort_order).map((p) => withPhotoUrl(supabase, p)),
  };
}

async function withListedDetails(supabase: SupabaseClient, rows: ListedRow[]): Promise<ProductWithDetails[]> {
  const photosByProduct = new Map<string, ProductPhoto[]>();
  if (rows.length > 0) {
    const { data, error } = await supabase
      .from("product_photos")
      .select("id, product_id, file_path, sort_order")
      .in("product_id", rows.map((r) => r.id))
      .order("sort_order");
    if (error) fail("product photos", error);
    for (const p of data as PhotoRow[]) {
      photosByProduct.set(p.product_id, [...(photosByProduct.get(p.product_id) ?? []), withPhotoUrl(supabase, p)]);
    }
  }

  return rows.map(({ plant_type_name, business_name, location, ...product }) => ({
    ...product,
    plantType: { id: product.plant_type_id, name: plant_type_name },
    business: { id: product.business_id, business_name, location },
    photos: photosByProduct.get(product.id) ?? [],
  }));
}

/* ---------- Catalog (Table 3.5) ---------- */

export type CatalogFilter = {
  q: string;
  plantTypes: string[];
  min?: number;
  max?: number;
  sort: ProductSort;
  page: number;
};

// Strip ILIKE/PostgREST pattern characters so the keyword matches literally
function sanitizeKeyword(q: string) {
  return q
    .trim()
    .toLowerCase()
    .replace(/[\\%_*]/g, "");
}

export async function searchProducts(filter: CatalogFilter) {
  const supabase = await createClient();

  // Step 2: normalize the keyword (trim + lowercase)
  const keyword = sanitizeKeyword(filter.q);
  const plantTypes = filter.plantTypes.filter(isValidUuid);

  const query = (columns: string, head = false) => {
    let q = supabase.from("listed_products").select(columns, { count: "exact", head });
    // Step 3: substring match on name or plant type (search_text = name + plant type)
    if (keyword) q = q.ilike("search_text", `%${keyword}%`);
    // Step 4: plant type and price range filters are combined with AND.
    // A product matches when its price range overlaps the filter range.
    if (plantTypes.length > 0) q = q.in("plant_type_id", plantTypes);
    if (filter.min !== undefined) q = q.gte("max_price", filter.min);
    if (filter.max !== undefined) q = q.lte("min_price", filter.max);
    return q;
  };

  const { count, error: countError } = await query("id", true);
  if (countError) fail("catalog", countError);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));
  const page = Math.min(Math.max(1, filter.page), totalPages);
  const from = (page - 1) * PRODUCTS_PER_PAGE;

  // Step 5: sort, then take one page
  let q = query(LISTED_COLUMNS);
  if (filter.sort === "price_asc") q = q.order("min_price", { ascending: true });
  else if (filter.sort === "price_desc") q = q.order("max_price", { ascending: false });
  q = q.order("created_at", { ascending: false }).range(from, from + PRODUCTS_PER_PAGE - 1);

  const { data, error } = await q;
  if (error) fail("catalog", error);

  return {
    products: await withListedDetails(supabase, data as unknown as ListedRow[]),
    total,
    page,
    totalPages,
  };
}

export async function getLatestProducts(limit: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listed_products")
    .select(LISTED_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) fail("latest products", error);
  return withListedDetails(supabase, data as ListedRow[]);
}

// Product detail: the WhatsApp number is only readable by signed-in users (RLS)
export async function getProduct(id: string) {
  if (!isValidUuid(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("listed_products").select(LISTED_COLUMNS).eq("id", id).maybeSingle();
  if (error) fail("product", error);
  if (!data) return null;

  const [product] = await withListedDetails(supabase, [data as ListedRow]);
  const { data: contact } = await supabase
    .from("business_profiles")
    .select("whatsapp_number")
    .eq("id", product.business_id)
    .maybeSingle();
  return { ...product, business: { ...product.business, whatsapp_number: contact?.whatsapp_number ?? "" } };
}

export async function getOtherBusinessProducts(businessId: string, excludeId: string, limit: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listed_products")
    .select(LISTED_COLUMNS)
    .eq("business_id", businessId)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) fail("other products", error);
  return withListedDetails(supabase, data as ListedRow[]);
}

export async function listPlantTypes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plant_type_summary")
    .select("id, name, product_count")
    .order("name");
  if (error) fail("plant types", error);
  return (data as (PlantType & { product_count: number })[]).map(({ product_count, ...t }) => ({
    ...t,
    productCount: product_count,
  }));
}

/* ---------- Farmer ---------- */

export async function getFarmerBusiness(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_profiles")
    .select("id, user_id, business_name, location, whatsapp_number")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) fail("business profile", error);
  return data as BusinessProfile | null;
}

export async function listBusinessProducts(businessId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_RELATION_COLUMNS)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (error) fail("products", error);
  return (data as unknown as ProductRelationRow[]).map((r) => fromRelationRow(supabase, r));
}

export async function getBusinessProduct(businessId: string, productId: string) {
  if (!isValidUuid(productId)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_RELATION_COLUMNS)
    .eq("id", productId)
    .eq("business_id", businessId)
    .maybeSingle();
  if (error) fail("product", error);
  return data ? fromRelationRow(supabase, data as unknown as ProductRelationRow) : null;
}

/* ---------- Admin (RLS: only admins see every row) ---------- */

export async function getAdminStats() {
  const supabase = await createClient();
  const countRows = async (q: PromiseLike<{ count: number | null; error: { message: string } | null }>) => {
    const { count, error } = await q;
    if (error) fail("stats", error);
    return count ?? 0;
  };
  const [farmers, buyers, products, plantTypes] = await Promise.all([
    countRows(supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "farmer")),
    countRows(supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "buyer")),
    countRows(supabase.from("listed_products").select("id", { count: "exact", head: true })),
    countRows(supabase.from("plant_types").select("id", { count: "exact", head: true })),
  ]);
  return { farmers, buyers, products, plantTypes };
}

export async function listUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role, status, created_at")
    .order("created_at", { ascending: false });
  if (error) fail("users", error);
  return data as User[];
}

export async function listAllProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_RELATION_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) fail("products", error);
  return (data as unknown as ProductRelationRow[]).map((r) => fromRelationRow(supabase, r));
}

export async function listPlantTypesForAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plant_types")
    .select("id, name, products (count)")
    .order("name");
  if (error) fail("plant types", error);
  return (data as (PlantType & { products: { count: number }[] })[]).map(({ products, ...t }) => ({
    ...t,
    productCount: products[0]?.count ?? 0,
  }));
}
