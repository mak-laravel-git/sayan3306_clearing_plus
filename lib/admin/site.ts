import "server-only";

import { headers } from "next/headers";

import { ADMIN_SITE_HEADER, validSiteKey } from "@/lib/admin/site-keys";

export { ADMIN_SITE_COOKIE, type AdminSite } from "@/lib/admin/site-keys";

/** Per-site admin endpoints; everything else (backups, audit, users) is shared. */
const SITE_SCOPED = /^\/admin\/(settings|seo)(\/|\?|$)/;

/**
 * The site named in the page URL, as the proxy passed it on. It only picks
 * which `/admin/sites/{site}/...` route the BFF calls; the API decides on every
 * request whether this admin may touch that site.
 */
export async function selectedSiteKey(): Promise<string | null> {
  return validSiteKey((await headers()).get(ADMIN_SITE_HEADER));
}

/**
 * `/admin/seo/pages` becomes `/admin/sites/job/seo/pages` while Job+ is
 * selected. Without a chosen site the plain route runs for the site the
 * admin signed in on.
 */
export async function scopeToSite(path: string, site?: string | null): Promise<string> {
  if (!SITE_SCOPED.test(path)) return path;

  const key = site === undefined ? await selectedSiteKey() : validSiteKey(site);
  return key ? path.replace(/^\/admin\//, `/admin/sites/${key}/`) : path;
}
