import "server-only";

import type { SeoTraffic } from "@/lib/admin/seo-traffic-types";
import { authedRequest } from "@/lib/auth/api";

export async function getSeoTraffic(days = 28) {
  return authedRequest<SeoTraffic>("get", `/admin/seo/traffic?days=${days}`);
}

export async function saveSeoTrafficEnabled(enabled: boolean) {
  return authedRequest<SeoTraffic>("put", "/admin/seo/traffic/settings", { enabled });
}
