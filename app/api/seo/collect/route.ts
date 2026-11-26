import type { NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/session";
import { clientIp } from "@/lib/seo/client-ip";
import { forwardCollect } from "@/lib/seo/collect";

const MAX_BODY_BYTES = 4096;
const METRICS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);

type Metric = { name: string; value: number; rating: string };

function isMetric(value: unknown): value is Metric {
  if (typeof value !== "object" || value === null) return false;
  const metric = value as Record<string, unknown>;
  return (
    typeof metric.name === "string" &&
    METRICS.has(metric.name) &&
    typeof metric.value === "number" &&
    Number.isFinite(metric.value) &&
    typeof metric.rating === "string"
  );
}

const noContent = () => new Response(null, { status: 204 });

/**
 * Receives page views and Core Web Vitals from the public site and forwards
 * them to the API. Nothing is counted for signed-in users, or for visitors
 * who send Do Not Track or Global Privacy Control.
 */
export async function POST(request: NextRequest) {
  const headers = request.headers;

  if (headers.get("dnt") === "1" || headers.get("sec-gpc") === "1" || request.cookies.has(SESSION_COOKIE)) {
    return noContent();
  }

  if (Number(headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return noContent();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return noContent();
  }

  const ip = clientIp(headers);
  const path = typeof body.path === "string" ? body.path : "";

  if (!ip || !path.startsWith("/") || path.length > 255) return noContent();

  const userAgent = headers.get("user-agent") ?? "";

  if (body.type === "view") {
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 2048) : "";
    await forwardCollect({ type: "view", path, referrer, ip, user_agent: userAgent });
  } else if (body.type === "vitals" && Array.isArray(body.metrics)) {
    const metrics = body.metrics.filter(isMetric).slice(0, 5);
    if (metrics.length > 0) await forwardCollect({ type: "vitals", path, metrics, ip, user_agent: userAgent });
  }

  return noContent();
}
