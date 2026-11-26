import type { NextRequest } from "next/server";

import { clientIp } from "@/lib/seo/client-ip";

/**
 * A cheap prefilter. The API decides which user agents are crawlers it
 * records; this only avoids a network call for ordinary browsers.
 */
export const BOT_UA =
  /googlebot|google-inspectiontool|bingbot|applebot|duckduckbot|yandexbot|baiduspider|gptbot|chatgpt-user|oai-searchbot|claudebot|anthropic-ai|ccbot|perplexitybot|bytespider|amazonbot/i;

/**
 * Tells the API a crawler requested a page. Runs from the proxy through
 * `event.waitUntil`, after the response is on its way. The proxy cannot see
 * the response status, so this records "requested", nothing more.
 */
export async function reportBotHit(request: NextRequest): Promise<void> {
  const base = process.env.LARAVEL_API_URL;
  const secret = process.env.BFF_SECRET;
  const ip = clientIp(request.headers);

  if (!base || !secret || !ip) return;

  const origin = process.env.SEO_PRIMARY_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;

  try {
    await fetch(`${base.replace(/\/$/, "")}/api/v1/seo/collect`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-BFF-Secret": secret,
        "X-Frontend-Origin": origin,
      },
      body: JSON.stringify({
        type: "bot",
        path: request.nextUrl.pathname,
        ip,
        user_agent: request.headers.get("user-agent") ?? "",
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Monitoring must never affect a crawler's response.
  }
}
