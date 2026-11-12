"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { homeForRole, safeRedirectPath } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";
import { formValues, loginSchema, registerSchema, type FormState } from "@/lib/validation";

// Passwords are verified by Supabase Auth (bcrypt hash) and never stored by the app.
export async function login(previous: FormState, formData: FormData): Promise<FormState> {
  const { password: _, ...values } = formValues(formData);
  const attempt = previous.attempt + 1;

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values, attempt };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    const message =
      error.code === "invalid_credentials"
        ? "Email atau kata sandi salah. Periksa lagi lalu coba masuk."
        : error.code === "email_not_confirmed"
          ? "Email belum dikonfirmasi. Buka tautan konfirmasi di email kamu."
          : `Belum bisa masuk: ${error.message}`;
    return { message, values, attempt };
  }

  const { data: user } = await supabase
    .from("users")
    .select("role, status")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!user || user.status === "blocked") {
    await supabase.auth.signOut();
    return {
      message: user
        ? "Akun ini diblokir admin. Hubungi admin Tanihias untuk membukanya."
        : "Data akun tidak ditemukan. Hubungi admin Tanihias.",
      values,
      attempt,
    };
  }

  redirect(safeRedirectPath(values.next) ?? homeForRole(user.role as Role));
}

export async function register(previous: FormState, formData: FormData): Promise<FormState> {
  const { password: _, ...values } = formValues(formData);
  const attempt = previous.attempt + 1;

  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values, attempt };
  }

  const supabase = await createClient();
  // The on_auth_user_created trigger creates the users row (and a business profile for farmers)
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { name: parsed.data.name, role: parsed.data.role } },
  });

  if (error) {
    // U04: an email that is already registered is rejected
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return { errors: { email: ["Email ini sudah terdaftar. Masuk saja, atau pakai email lain."] }, values, attempt };
    }
    if (error.code === "weak_password") {
      return { errors: { password: ["Kata sandi terlalu lemah. Pakai minimal 8 karakter."] }, values, attempt };
    }
    if (error.code === "email_address_invalid") {
      return { errors: { email: ["Alamat email ini tidak bisa dipakai. Coba email lain."] }, values, attempt };
    }
    return { message: `Belum bisa mendaftar: ${error.message}`, values, attempt };
  }

  // If "Confirm email" is still enabled in Supabase, no session is created yet
  if (!data.session) {
    return {
      success: true,
      message: "Akun dibuat. Buka tautan konfirmasi yang dikirim ke email kamu, lalu masuk.",
      attempt,
    };
  }

  // New farmers are sent to complete their business profile first (Figure 3.3)
  if (parsed.data.role === "farmer") redirect("/farmer/profile");
  redirect(safeRedirectPath(values.next) ?? "/catalog");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
