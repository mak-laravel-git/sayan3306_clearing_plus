import "server-only";

import { cache } from "react";

import { selectedSiteKey, type AdminSite } from "@/lib/admin/site";
import { authedRequest } from "@/lib/auth/api";

/** The sites this admin can switch between; empty when the API is single-site or refuses. */
export const getAdminSites = cache(async (): Promise<AdminSite[]> => {
  try {
    const data = await authedRequest<{ sites: AdminSite[] }>("get", "/admin/sites");
    return data.sites;
  } catch {
    return [];
  }
});

/** The site being edited: the saved choice if it still exists, else the first (control) site. */
export async function currentAdminSite(sites: AdminSite[]): Promise<AdminSite | null> {
  const key = await selectedSiteKey();
  return sites.find((site) => site.key === key) ?? sites[0] ?? null;
}
