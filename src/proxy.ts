import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { homeForRole } from "@/lib/routes";
import type { Role } from "@/lib/types";

// Runs before every page:
// 1. Refreshes the Supabase session token and writes its new cookies.
// 2. A first access check. Pages, Server Actions, and RLS in the database
//    check again before showing or changing data.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  let headerCache: Record<string, string> = {};

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          headerCache = headers;
          Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
        },
      },
    },
  );

  // Do not put any other code between createServerClient and getClaims
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  const { pathname, search } = request.nextUrl;
  const redirectTo = (path: string) => {
    const redirect = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    Object.entries(headerCache).forEach(([k, v]) => redirect.headers.set(k, v));
    return redirect;
  };

  // The catalog is public, but product details and farmer contacts require signing in
  const requiresLogin =
    pathname.startsWith("/products/") || pathname.startsWith("/farmer") || pathname.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (!requiresLogin && !isAuthPage) return response;

  if (!userId) {
    return requiresLogin ? redirectTo(`/login?next=${encodeURIComponent(pathname + search)}`) : response;
  }

  const { data: user } = await supabase
    .from("users")
    .select("role, status")
    .eq("id", userId)
    .maybeSingle();

  // Blocked or deleted accounts are treated as signed out
  if (!user || user.status !== "active") {
    return requiresLogin ? redirectTo("/login") : response;
  }

  const role = user.role as Role;
  if (isAuthPage) return redirectTo(homeForRole(role));
  if (pathname.startsWith("/farmer") && role !== "farmer") return redirectTo("/");
  if (pathname.startsWith("/admin") && role !== "admin") return redirectTo("/");
  return response;
}

export const config = {
  // Every page except static files, so the session is always refreshed
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
