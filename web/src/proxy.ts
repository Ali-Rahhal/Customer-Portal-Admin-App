import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { validateAuth } from "./utils/apiCalls";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const publicRoutes = ["/login"];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // --------------------------------------------------
  // Get locale from pathname
  // --------------------------------------------------

  const locale = routing.locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  // Let next-intl handle requests without a locale
  if (!locale) {
    return intlMiddleware(request);
  }

  // --------------------------------------------------
  // Remove locale from pathname
  // --------------------------------------------------

  const pathnameWithoutLocale =
    pathname === `/${locale}` ? "/" : pathname.slice(`/${locale}`.length);

  // --------------------------------------------------
  // Authentication
  // --------------------------------------------------

  const cookie = request.headers.get("cookie") || "";

  let isAuth = false;

  try {
    const result = await validateAuth(cookie);
    isAuth = result.status === 200;
  } catch (error: any) {
    console.log("Authentication check failed:", error?.message);

    isAuth = false;
  }

  // --------------------------------------------------
  // Public route check
  // --------------------------------------------------

  const isPublicRoute = publicRoutes.some((route) =>
    matchesRoute(pathnameWithoutLocale, route),
  );

  // --------------------------------------------------
  // Authenticated user trying to access public page
  // --------------------------------------------------

  if (isAuth && isPublicRoute) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // --------------------------------------------------
  // Unauthenticated user trying to access protected page
  // --------------------------------------------------

  if (!isAuth && !isPublicRoute) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // --------------------------------------------------
  // Continue with next-intl
  // --------------------------------------------------

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(en|fr)/:path*"],
};
