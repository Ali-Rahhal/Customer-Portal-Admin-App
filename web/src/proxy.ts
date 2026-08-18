import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { user } from "./utils/apiCalls";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const unauthRoutes = ["/login"];
const authRoutes = ["/"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // --------------------------------------------------
  // Let next-intl handle locale detection/routing
  // --------------------------------------------------

  const intlResponse = intlMiddleware(request);

  // --------------------------------------------------
  // Get locale from the pathname
  // --------------------------------------------------

  const locale = routing.locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  // If there is no locale yet, let next-intl handle it.
  if (!locale) {
    return intlResponse;
  }

  // Remove locale from pathname for route matching.
  const pathnameWithoutLocale =
    pathname === `/${locale}` ? "/" : pathname.replace(`/${locale}`, "");

  // --------------------------------------------------
  // Authentication
  // --------------------------------------------------

  const cookie = request.headers.get("cookie") || "";

  let isAuth = false;

  try {
    const result = await user(cookie);
    isAuth = result.status === 200;
  } catch (error: any) {
    console.log("Authentication check failed:", error?.message);

    isAuth = false;
  }

  // --------------------------------------------------
  // Route matching
  // --------------------------------------------------

  const isUnauthRoute = unauthRoutes.some(
    (route) =>
      pathnameWithoutLocale === route ||
      pathnameWithoutLocale.startsWith(route + "/"),
  );

  const isAuthRoute = authRoutes.some(
    (route) =>
      pathnameWithoutLocale === route ||
      pathnameWithoutLocale.startsWith(route + "/"),
  );

  // --------------------------------------------------
  // Authenticated user on login page
  // --------------------------------------------------

  if (isAuth && isUnauthRoute) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // --------------------------------------------------
  // Unauthenticated user on protected route
  // --------------------------------------------------

  if (!isAuth && isAuthRoute) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // --------------------------------------------------
  // Continue with next-intl response
  // --------------------------------------------------

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
