import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

import {
  SESSION_COOKIE,
  decrypt,
  sessionLooksAuthenticated,
} from "@/lib/auth/session";
import { SESSION_EXPIRED_REASON } from "@/lib/auth/session-expired";
import { runWithFrontendOrigin } from "@/lib/auth/frontend-origin-store";
import {
  ADMIN_SITE_COOKIE,
  ADMIN_SITE_HEADER,
  ADMIN_SITE_PARAM,
  isSiteScopedPage,
  validSiteKey,
} from "@/lib/admin/site-keys";
import { ACCOUNT_HOME, homeFor, isAccountPath, portalOfPath } from "@/lib/auth/portals";
import { BOT_UA, reportBotHit } from "@/lib/seo/bot-hit";

/**
 * Proxy (Next.js 16's replacement for middleware.ts) only does the
 * *optimistic* check: does a cookie exist that looks like a live session?
 * It is not the authorization boundary - every Server Component, Server
 * Action, and Route Handler that touches the Laravel API re-verifies via
 * `getSession()`/`authedRequest()`, which can hit a 401 and revoke/redirect
 * on its own. This keeps Proxy fast and avoids the anti-pattern of treating
 * it as a full session store.
 */
const AUTH_ONLY_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/two-factor-challenge",
  "/verify-email",
  "/activate",
];

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  // Crawler visits are reported after the response is sent; the API ignores them while monitoring is off.
  if (request.method === "GET" && BOT_UA.test(request.headers.get("user-agent") ?? "")) {
    event.waitUntil(reportBotHit(request));
  }

  // Behind a proxy `nextUrl.origin` is the server's own bind address (localhost:3000), so the configured public URL comes first.
  const origin =
    request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  return runWithFrontendOrigin(origin, () => handleProxy(request));
}

async function handleProxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Crawlers want a 200 ICO at /favicon.ico, not a redirect to a PNG.
  if (pathname === "/favicon.ico") {
    const url = request.nextUrl.clone();
    url.pathname = "/brand/favicon.ico";
    return NextResponse.rewrite(url);
  }

  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  // Every dashboard and the account area need a signed-in person; which role may open which is decided by the layouts and the API.
  const isProtected = portalOfPath(pathname) !== null || isAccountPath(pathname);
  const isAuthOnlyPage = AUTH_ONLY_PATHS.includes(pathname);

  if (!isProtected && !isAuthOnlyPage) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await decrypt(cookie);
  const authenticated = sessionLooksAuthenticated(session);
  // An unreadable or past-deadline cookie is dropped so RSC never sees it.
  const clearedSession = Boolean(cookie) && !authenticated;

  if (clearedSession) {
    request.cookies.delete(SESSION_COOKIE);
  }

  if (isProtected && !authenticated) {
    // Proxy redirects take an absolute URL; Next itself turns it into a relative
    // Location before it leaves the server (unlike Route Handlers, see lib/http/redirect.ts).
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", pathname);
    if (clearedSession) {
      loginUrl.searchParams.set("reason", SESSION_EXPIRED_REASON);
    }
    const redirectResponse = NextResponse.redirect(loginUrl);
    if (clearedSession) {
      redirectResponse.cookies.delete(SESSION_COOKIE);
    }
    return redirectResponse;
  }

  if (isAuthOnlyPage && authenticated) {
    // Signed in already: go to the dashboard of the role (the layout re-checks it).
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = session?.user ? homeFor(session.user) : ACCOUNT_HOME;
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  // Which site the application settings screens edit. Never trust an incoming header.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(ADMIN_SITE_HEADER);
  // Lets a layout know which page it is rendering for (layouts do not receive the path).
  requestHeaders.set("x-pathname", pathname);

  let chosenSite: string | null = null;

  if (isAdmin && isSiteScopedPage(pathname)) {
    chosenSite = validSiteKey(request.nextUrl.searchParams.get(ADMIN_SITE_PARAM));

    if (!chosenSite) {
      // Make the site explicit in the URL: reopen the one used last time.
      const remembered = validSiteKey(request.cookies.get(ADMIN_SITE_COOKIE)?.value);
      if (remembered) {
        const siteUrl = request.nextUrl.clone();
        siteUrl.searchParams.set(ADMIN_SITE_PARAM, remembered);
        return NextResponse.redirect(siteUrl);
      }
    } else {
      requestHeaders.set(ADMIN_SITE_HEADER, chosenSite);
    }
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  if (chosenSite) {
    response.cookies.set(ADMIN_SITE_COOKIE, chosenSite, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  if (clearedSession) {
    response.cookies.delete(SESSION_COOKIE);
  }

  return response;
}

export const config = {
  matcher: [
    "/favicon.ico",
    "/admin",
    "/admin/:path*",
    "/ppm",
    "/ppm/:path*",
    "/player",
    "/player/:path*",
    "/guardian",
    "/guardian/:path*",
    "/club",
    "/club/:path*",
    "/account",
    "/account/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/two-factor-challenge",
    "/verify-email",
    "/activate",
    // Public pages, for crawler monitoring only: no assets, API routes or generated files.
    "/((?!api/|_next/|brand/|og$|.*\\.[A-Za-z0-9]+$).*)",
  ],
};
