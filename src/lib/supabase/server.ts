import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

export const PHOTO_BUCKET = "product-photos";

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are not set. Copy .env.example to .env.local and fill them in from the Supabase dashboard.",
    );
  }
  return { url, key };
}

// Supabase client for Server Components and Server Actions. Create a new one
// for every request; the user session is read from cookies so RLS applies.
export async function createClient() {
  const cookieStore = await cookies();
  // The Supabase client calls Date.now() when checking token expiry.
  // connection() defers this code to request time, so it does not run
  // during Partial Prefetching (which rejects time values).
  await connection();
  const { url, key } = getSupabaseEnv();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component (cookies cannot be written during render).
          // Safe to ignore because proxy.ts already refreshes the session on every request.
        }
      },
    },
  });
}
