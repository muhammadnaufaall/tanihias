"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isValidUuid } from "@/lib/data";
import { requireSession } from "@/lib/session";
import { PHOTO_BUCKET, createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";
import { formValues, plantTypeSchema, type FormState } from "@/lib/validation";

async function adminClient() {
  await requireSession("admin");
  return createClient();
}

function revalidateAll() {
  revalidatePath("/", "layout");
}

async function removePhotoFiles(supabase: Awaited<ReturnType<typeof createClient>>, productIds: string[]) {
  if (productIds.length === 0) return;
  const { data } = await supabase.from("product_photos").select("file_path").in("product_id", productIds);
  const paths = (data ?? []).map((p) => p.file_path as string);
  if (paths.length > 0) await supabase.storage.from(PHOTO_BUCKET).remove(paths);
}

export async function setBlocked(id: string, blocked: boolean): Promise<ActionResult> {
  const supabase = await adminClient();
  const { data } = isValidUuid(id)
    ? await supabase
        .from("users")
        .update({ status: blocked ? "blocked" : "active" })
        .eq("id", id)
        .select("name")
    : { data: [] };
  if (!data || data.length === 0) return { ok: false, message: "Akun ini tidak bisa diubah." };

  revalidateAll();
  const name = data[0].name as string;
  return { ok: true, message: blocked ? `${name} diblokir.` : `Blokir ${name} dibuka.` };
}

export async function deleteAccount(id: string): Promise<ActionResult> {
  const supabase = await adminClient();
  if (!isValidUuid(id)) return { ok: false, message: "Akun tidak ditemukan." };
  const { data: user } = await supabase.from("users").select("name, role").eq("id", id).maybeSingle();
  if (!user) return { ok: false, message: "Akun tidak ditemukan." };
  if (user.role === "admin") return { ok: false, message: "Akun admin tidak bisa dihapus." };

  const { data: products } = await supabase
    .from("products")
    .select("id, business_profiles!inner (user_id)")
    .eq("business_profiles.user_id", id);
  await removePhotoFiles(supabase, (products ?? []).map((p) => p.id as string));

  const { error } = await supabase.rpc("delete_user", { p_id: id });
  if (error) return { ok: false, message: `Akun belum terhapus: ${error.message}` };

  revalidateAll();
  return { ok: true, message: `Akun ${user.name} dihapus.` };
}

export async function addPlantType(previous: FormState, formData: FormData): Promise<FormState> {
  const supabase = await adminClient();
  const values = formValues(formData);
  const attempt = previous.attempt + 1;

  const parsed = plantTypeSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values, attempt };
  }

  const { error } = await supabase.from("plant_types").insert({ name: parsed.data.name });
  if (error) {
    if (error.code === "23505") return { errors: { name: ["Jenis ini sudah ada."] }, values, attempt };
    return { message: `Jenis belum tersimpan: ${error.message}`, values, attempt };
  }

  revalidateAll();
  return { success: true, message: `Jenis "${parsed.data.name}" ditambahkan.`, attempt };
}

export async function deletePlantType(id: string): Promise<ActionResult> {
  const supabase = await adminClient();
  const { data, error } = isValidUuid(id)
    ? await supabase.from("plant_types").delete().eq("id", id).select("name")
    : { data: [], error: null };

  if (error?.code === "23503") {
    return { ok: false, message: "Jenis ini masih dipakai produk. Pindahkan atau hapus produknya dulu." };
  }
  if (error) return { ok: false, message: `Jenis belum terhapus: ${error.message}` };
  if (!data || data.length === 0) return { ok: false, message: "Jenis tanaman tidak ditemukan." };

  revalidateAll();
  return { ok: true, message: `Jenis "${data[0].name}" dihapus.` };
}

export async function takeDownProduct(id: string): Promise<ActionResult> {
  const supabase = await adminClient();
  if (!isValidUuid(id)) return { ok: false, message: "Produk tidak ditemukan." };

  await removePhotoFiles(supabase, [id]);
  const { data, error } = await supabase.from("products").delete().eq("id", id).select("name");
  if (error) return { ok: false, message: `Produk belum diturunkan: ${error.message}` };
  if (!data || data.length === 0) return { ok: false, message: "Produk tidak ditemukan." };

  revalidateAll();
  return { ok: true, message: `${data[0].name} diturunkan dari katalog.` };
}
