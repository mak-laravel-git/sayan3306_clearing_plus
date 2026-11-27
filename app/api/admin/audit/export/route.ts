import { Readable } from "node:stream";

import type { NextRequest } from "next/server";

import { toAuditQuery } from "@/lib/admin/audit";
import { getSession } from "@/lib/auth/auth-cookies";
import { laravelHttp } from "@/lib/auth/http";
import { redirectTo } from "@/lib/http/redirect";
import { logoutUrl } from "@/lib/auth/session-expired";

export const dynamic = "force-dynamic";

const AUDIT_PAGE = "/admin/application/audit";

/**
 * The browser navigates here with the screen's current filters. The CSV
 * streams from Laravel through this handler, so the Sanctum token stays on
 * the server.
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.accessToken) {
    return redirectTo(logoutUrl(AUDIT_PAGE));
  }
  if (session.user.role !== "platform_admin") {
    return redirectTo("/admin");
  }

  const query = toAuditQuery(request.nextUrl.searchParams, { paginate: false });

  let upstream;
  try {
    upstream = await laravelHttp.get<Readable>(`/admin/audit/export?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        Accept: "text/csv, application/json",
      },
      responseType: "stream",
      timeout: 0,
    });
  } catch {
    return backToPage(request, "The audit service is unavailable.");
  }

  if (upstream.status === 401) {
    upstream.data.destroy();
    return redirectTo(logoutUrl(AUDIT_PAGE));
  }

  if (upstream.status === 429) {
    upstream.data.destroy();
    return backToPage(request, "Too many exports. Wait a minute and try again.");
  }

  if (upstream.status !== 200) {
    upstream.data.destroy();
    return backToPage(request, "The export could not be created.");
  }

  const headers = new Headers({
    "content-type": "text/csv; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  const disposition = upstream.headers["content-disposition"];
  headers.set(
    "content-disposition",
    typeof disposition === "string" ? disposition : 'attachment; filename="audit-log.csv"',
  );

  return new Response(Readable.toWeb(upstream.data) as ReadableStream, {
    status: 200,
    headers,
  });
}

function backToPage(request: NextRequest, message: string) {
  const params = new URLSearchParams(request.nextUrl.searchParams);
  params.set("export_error", message);
  return redirectTo(`${AUDIT_PAGE}?${params.toString()}`, 303);
}
