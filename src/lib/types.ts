export type Role = "buyer" | "farmer" | "admin";
export type AccountStatus = "active" | "blocked";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;
  created_at: string;
};

export type BusinessProfile = {
  id: string;
  user_id: string;
  business_name: string;
  location: string;
  whatsapp_number: string;
};

export type PlantType = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  business_id: string;
  plant_type_id: string;
  name: string;
  description: string;
  min_price: number;
  max_price: number;
  is_available: boolean;
  created_at: string;
};

export type ProductPhoto = {
  id: string;
  product_id: string;
  file_path: string;
  sort_order: number;
  url: string;
};

export type ProductWithDetails = Product & {
  plantType: PlantType;
  business: Pick<BusinessProfile, "id" | "business_name" | "location"> & { whatsapp_number?: string };
  photos: ProductPhoto[];
};

export type Session = Pick<User, "id" | "name" | "email" | "role">;

export type ProductSort = "newest" | "price_asc" | "price_desc";

export type ActionResult = { ok: boolean; message: string };
