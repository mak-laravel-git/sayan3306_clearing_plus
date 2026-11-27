import { NextResponse } from "next/server.js";

/**
 * Redirect to a path on this same site.
 *
 * Route Handlers must not build an absolute URL from `request.url` or
 * `request.nextUrl`: behind a reverse proxy, `next start` derives them from its
 * own bind address, so the browser was sent to `https://localhost:3000/...`.
 * A relative `Location` needs no host at all - the browser resolves it against
 * the address it is already on - so it is correct on every domain and cannot be
 * steered by a forged Host or X-Forwarded-Host header.
 */
export function redirectTo(path: string, status: 301 | 302 | 303 | 307 | 308 = 307): NextResponse {
  // Only a path on this site: no scheme, no protocol-relative `//host`, no backslash tricks.
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    throw new Error(`redirectTo() only accepts a path on this site, got "${path}".`);
  }

  return new NextResponse(null, { status, headers: { Location: path } });
}
