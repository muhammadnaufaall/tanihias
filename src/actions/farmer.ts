"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isValidUuid } from "@/lib/data";
import { requireSession } from "@/lib/session";
import { PHOTO_BUCKET, createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";
import {
  PHOTO_ALLOWED_TYPES,
  PHOTO_MAX_COUNT,
  PHOTO_MAX_SIZE,
  businessProfileSchema,
  formValues,
  productSchema,
  type FormState,
} from "@/lib/validation";

async function getFarmerContext() {
  const session = await requireSession("farmer");
  const supabase = await createClient();
  const { data: business } = await supabase.from("business_profiles").select("id").eq("user_id", session.id).maybeSingle();
  if (!business) redirect("/");
  return { session, supabase, businessId: business.id as string };
}

function revalidateProductPages() {
  revalidatePath("/farmer", "layout");
  revalidatePath("/catalog");
  revalidatePath("/");
}

function validatePhotos(photos: File[]) {
  if (photos.length > PHOTO_MAX_COUNT) return `Maksimal ${PHOTO_MAX_COUNT} foto per produk.`;
  if (photos.some((f) => !PHOTO_ALLOWED_TYPES.includes(f.type))) return "Format foto harus JPG atau PNG.";
  if (photos.some((f) => f.size > PHOTO_MAX_SIZE)) return "Ukuran setiap foto maksimal 2 MB.";
  return null;
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

async function deleteProductPhotos(supabase: Supabase, productId: string) {
  const { data } = await supabase.from("product_photos").select("file_path").eq("product_id", productId);
  const paths = (data ?? []).map((p) => p.file_path as string);
  if (paths.length > 0) await supabase.storage.from(PHOTO_BUCKET).remove(paths);
  await supabase.from("product_photos").delete().eq("product_id", productId);
}

async function uploadPhotos(supabase: Supabase, userId: string, productId: string, photos: File[]) {
  for (const [sortOrder, file] of photos.entries()) {
    const extension = file.type === "image/png" ? "png" : "jpg";
    const path = `${userId}/${productId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: file.type });
    if (error) return error.message;
    const { error: rowError } = await supabase
      .from("product_photos")
      .insert({ product_id: productId, file_path: path, sort_order: sortOrder });
    if (rowError) return rowError.message;
  }
  return null;
}

export async function saveProduct(previous: FormState, formData: FormData): Promise<FormState> {
  const { session, supabase, businessId } = await getFarmerContext();
  const values = formValues(formData);
  const attempt = previous.attempt + 1;

  const parsed = productSchema.safeParse({
    ...values,
    is_available: formData.get("is_available") === "on",
  });
  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  const photoError = validatePhotos(photos);

  if (!parsed.success || photoError) {
    return {
      errors: {
        ...(parsed.success ? {} : z.flattenError(parsed.error).fieldErrors),
        ...(photoError ? { photos: [photoError] } : {}),
      },
      values,
      attempt,
    };
  }

  let productId = values.id;
  if (productId) {
    const { data } = isValidUuid(productId)
      ? await supabase.from("products").update(parsed.data).eq("id", productId).eq("business_id", businessId).select("id")
      : { data: [] };
    if (!data || data.length === 0) {
      return { message: "Produk ini bukan milik usaha kamu, jadi tidak bisa diubah.", values, attempt };
    }
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert({ ...parsed.data, business_id: businessId })
      .select("id")
      .single();
    if (error) {
      const message =
        error.code === "23503"
          ? "Jenis tanaman tidak ditemukan. Pilih dari daftar."
          : `Produk belum tersimpan: ${error.message}`;
      return { message, values, attempt };
    }
    productId = data.id as string;
  }

  if (photos.length > 0) {
    if (values.id) await deleteProductPhotos(supabase, productId);
    const uploadError = await uploadPhotos(supabase, session.id, productId, photos);
    if (uploadError) {
      if (!values.id) {
        await deleteProductPhotos(supabase, productId);
        await supabase.from("products").delete().eq("id", productId);
      }
      return { message: `Foto gagal diunggah: ${uploadError}`, values, attempt };
    }
  }

  revalidateProductPages();
  redirect(`/farmer?status=${values.id ? "updated" : "added"}&product=${productId}`);
}

export async function deleteMyProduct(productId: string): Promise<ActionResult> {
  const { supabase, businessId } = await getFarmerContext();
  const { data: product } = isValidUuid(productId)
    ? await supabase.from("products").select("id, name").eq("id", productId).eq("business_id", businessId).maybeSingle()
    : { data: null };
  if (!product) {
    return { ok: false, message: "Produk ini bukan milik usaha kamu, jadi tidak bisa dihapus." };
  }

  await deleteProductPhotos(supabase, product.id);
  const { error } = await supabase.from("products").delete().eq("id", product.id);
  if (error) return { ok: false, message: `Produk belum terhapus: ${error.message}` };

  revalidateProductPages();
  return { ok: true, message: `${product.name} dihapus dari katalog.` };
}

export async function saveBusinessProfile(previous: FormState, formData: FormData): Promise<FormState> {
  const { session, supabase } = await getFarmerContext();
  const values = formValues(formData);
  const attempt = previous.attempt + 1;

  const parsed = businessProfileSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values, attempt };
  }

  const { error } = await supabase.from("business_profiles").update(parsed.data).eq("user_id", session.id);
  if (error) return { message: `Profil belum tersimpan: ${error.message}`, values, attempt };

  revalidateProductPages();
  return { success: true, message: "Profil usaha tersimpan.", values, attempt };
}
