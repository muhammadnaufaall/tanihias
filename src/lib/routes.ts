import type { Role } from "@/lib/types";

export function homeForRole(role: Role) {
  if (role === "farmer") return "/farmer";
  if (role === "admin") return "/admin";
  return "/catalog";
}

export function safeRedirectPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}
