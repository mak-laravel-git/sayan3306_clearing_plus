import { Readable } from "node:stream";

import type { NextRequest } from "next/server";

import { clubQuery } from "@/lib/admin/clubs";
import { getSession } from "@/lib/auth/auth-cookies";
import { laravelHttp } from "@/lib/auth/http";
import { redirectTo } from "@/lib/http/redirect";
import { logoutUrl } from "@/lib/auth/session-expired";

export const dynamic = "force-dynamic";

const CLUBS_PAGE = "/admin/clubs";

/**
 * The browser navigates here with the screen's filters. The CSV streams from
 * Laravel through this handler, so the Sanctum token stays on the server.
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.accessToken) {
    return redirectTo(logoutUrl(CLUBS_PAGE));
  }
  if (!session.user.permissions?.includes("clubs.view")) {
    return redirectTo("/admin");
  }

  const params = request.nextUrl.searchParams;
  const query = clubQuery({
    q: params.get("q") ?? undefined,
    status: params.get("status") ?? undefined,
    email_status: params.get("email_status") ?? undefined,
    continent: params.get("continent") ?? undefined,
    country: params.get("country") ?? undefined,
    unreviewed: params.get("unreviewed") === "1",
    emailed: params.get("emailed") === "1" ? "yes" : params.get("emailed") === "0" ? "no" : "",
  });

  let upstream;
  try {
    upstream = await laravelHttp.get<Readable>(`/admin/clubs/export?${query.toString()}`, {
      headers: { Authorization: `Bearer ${session.accessToken}`, Accept: "text/csv, application/json" },
      responseType: "stream",
      timeout: 0,
    });
  } catch {
    return redirectTo(`${CLUBS_PAGE}?export_error=${encodeURIComponent("The club service is unavailable.")}`, 303);
  }

  if (upstream.status === 401) {
    upstream.data.destroy();
    return redirectTo(logoutUrl(CLUBS_PAGE));
  }

  if (upstream.status !== 200) {
    upstream.data.destroy();
    return redirectTo(`${CLUBS_PAGE}?export_error=${encodeURIComponent(upstream.status === 429 ? "Too many exports. Wait a minute and try again." : "The export could not be created.")}`, 303);
  }

  const headers = new Headers({
    "content-type": "text/csv; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  const disposition = upstream.headers["content-disposition"];
  headers.set("content-disposition", typeof disposition === "string" ? disposition : 'attachment; filename="clubs.csv"');

  return new Response(Readable.toWeb(upstream.data) as ReadableStream, { status: 200, headers });
}
