import "server-only";

import { cookies } from "next/headers";

/**
 * The site whose settings the admin is editing. Chosen with the switcher and
 * kept in a cookie. It only picks which `/admin/sites/{site}/...` route the
 * BFF calls; the API decides on every request whether this admin may touch
 * that site, so the cookie grants nothing by itself.
 */
export const ADMIN_SITE_COOKIE = "admin_site";

const SITE_KEY = /^[a-z0-9_-]{1,20}$/;

export type AdminSite = {
  key: string;
  name: string;
  origin: string | null;
  control: boolean;
};

/** Per-site admin endpoints; everything else (backups, audit, users) is shared. */
const SITE_SCOPED = /^\/admin\/(settings|seo)(\/|\?|$)/;

export async function selectedSiteKey(): Promise<string | null> {
  const value = (await cookies()).get(ADMIN_SITE_COOKIE)?.value;
  return value && SITE_KEY.test(value) ? value : null;
}

/**
 * `/admin/seo/pages` becomes `/admin/sites/job/seo/pages` while Job+ is
 * selected. Without a chosen site the plain route runs for the site the
 * admin signed in on.
 */
export async function scopeToSite(path: string): Promise<string> {
  if (!SITE_SCOPED.test(path)) return path;

  const site = await selectedSiteKey();
  return site ? path.replace(/^\/admin\//, `/admin/sites/${site}/`) : path;
}
