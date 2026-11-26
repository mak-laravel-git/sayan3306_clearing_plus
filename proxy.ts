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
];

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  // Crawler visits are reported after the response is sent; the API ignores them while monitoring is off.
  if (request.method === "GET" && BOT_UA.test(request.headers.get("user-agent") ?? "")) {
    event.waitUntil(reportBotHit(request));
  }

  const origin =
    request.headers.get("origin") ?? request.nextUrl.origin;

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
  const isAuthOnlyPage = AUTH_ONLY_PATHS.includes(pathname);

  if (!isAdmin && !isAuthOnlyPage) {
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

  if (isAdmin && !authenticated) {
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
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    adminUrl.search = "";
    return NextResponse.redirect(adminUrl);
  }

  // Which site the application settings screens edit. Never trust an incoming header.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(ADMIN_SITE_HEADER);

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
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/two-factor-challenge",
    // Public pages, for crawler monitoring only: no assets, API routes or generated files.
    "/((?!api/|_next/|brand/|og$|.*\\.[A-Za-z0-9]+$).*)",
  ],
};
