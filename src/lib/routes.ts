import type { Role } from "@/lib/types";

// Landing page after signing in, per Figure 3.4 (buyers to the catalog,
// farmers to their store dashboard, admins to the admin dashboard)
export function homeForRole(role: Role) {
  if (role === "farmer") return "/farmer";
  if (role === "admin") return "/admin";
  return "/catalog";
}

// Only allow internal paths to prevent open redirects
export function safeRedirectPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}
