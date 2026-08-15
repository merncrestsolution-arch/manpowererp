import { NextResponse } from "next/server";

import { auth } from "@/infrastructure/auth/auth";
import { hasAdminAccess } from "@/infrastructure/auth/roles";

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;
  const isAuthenticated = Boolean(session?.user);

  const publicPaths = ["/login", "/forgot-password"];
  const isPublicRoute =
    publicPaths.includes(pathname) || pathname.startsWith("/reset-password/");

  if (isPublicRoute) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      pathname === "/" ? "/dashboard" : pathname,
    );
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/admin")) {
    const role = session?.user?.role;
    if (!role || !hasAdminAccess(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
