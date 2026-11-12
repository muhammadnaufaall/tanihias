import { z } from "zod";

// Validation rules follow the black-box test scenarios (Table 3.7).
// Error messages are shown in the UI, so they stay in Indonesian.

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Isi email kamu."),
  password: z.string().min(1, "Isi kata sandi kamu."),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Isi nama lengkap, minimal 2 huruf."),
  email: z.string().trim().min(1, "Isi email kamu.").pipe(z.email("Format email belum benar, contoh: nama@email.com.")),
  // U05: 8 characters accepted, 7 rejected
  password: z.string().min(8, "Kata sandi minimal 8 karakter."),
  role: z.enum(["buyer", "farmer"], "Pilih daftar sebagai pembeli atau petani."),
});

const priceField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Isi ${label.toLowerCase()}.`)
    .transform(Number)
    .pipe(
      z
        .number(`${label} harus berupa angka.`)
        .int(`${label} harus bilangan bulat.`)
        // U08: price 0 rejected, price 1 accepted
        .min(1, `${label} minimal Rp1.`),
    );

export const productSchema = z
  .object({
    name: z.string().trim().min(1, "Isi nama produk."),
    // The placeholder option is disabled, so it is not submitted (undefined)
    plant_type_id: z.string("Pilih jenis tanaman.").min(1, "Pilih jenis tanaman."),
    description: z.string().trim().max(1000, "Deskripsi maksimal 1.000 karakter."),
    min_price: priceField("Harga minimum"),
    max_price: priceField("Harga maksimum"),
    is_available: z.boolean(),
  })
  .refine((d) => d.max_price >= d.min_price, {
    path: ["max_price"],
    message: "Harga maksimum tidak boleh lebih kecil dari harga minimum.",
  });

export const businessProfileSchema = z.object({
  business_name: z.string().trim().min(3, "Isi nama usaha, minimal 3 huruf."),
  location: z.string().trim().min(3, "Isi lokasi kebun, misalnya nama kampung di Cihideung."),
  whatsapp_number: z
    .string()
    .trim()
    .regex(/^(\+62|62|0)8\d{7,12}$/, "Nomor WhatsApp belum benar, contoh: 081234567890."),
});

export const plantTypeSchema = z.object({
  name: z.string().trim().min(3, "Nama jenis minimal 3 huruf.").max(40, "Nama jenis maksimal 40 huruf."),
});

// U09: photo upload limits
export const PHOTO_ALLOWED_TYPES = ["image/jpeg", "image/png"];
export const PHOTO_MAX_SIZE = 2 * 1024 * 1024;
export const PHOTO_MAX_COUNT = 3;

export type FieldErrors = Record<string, string[] | undefined>;

export type FormState = {
  success?: boolean;
  message?: string;
  errors?: FieldErrors;
  values?: Record<string, string>;
  // Incremented on every submission so the form remounts with the last values
  attempt: number;
};

export const initialFormState: FormState = { attempt: 0 };

export function formValues(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) values[key] = value;
  }
  return values;
}
