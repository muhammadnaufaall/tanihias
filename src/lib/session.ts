import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Role, Session } from "@/lib/types";

// Read once per request even when called from both the header and the page.
export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;

  const { data: user } = await supabase
    .from("users")
    .select("id, name, email, role, status")
    .eq("id", userId)
    .maybeSingle();

  // Accounts deleted or blocked by an admin are treated as signed out
  if (!user || user.status !== "active") return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role as Role };
});

export async function requireSession(role?: Role): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (role && session.role !== role) redirect("/");
  return session;
}
