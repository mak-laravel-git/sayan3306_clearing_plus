import "server-only";

import { seoFetch } from "@/lib/seo/api";

/** Forwards one monitoring event to the API. Failures are swallowed: a visitor never waits on or sees them. */
export async function forwardCollect(payload: Record<string, unknown>): Promise<void> {
  try {
    await seoFetch("/seo/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    // ignored on purpose
  }
}
