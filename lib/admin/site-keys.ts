/**
 * Shared by the proxy, server code and client components, so it has no
 * server-only imports. Which site the application settings screens edit is
 * written in the URL (`?site=job`); the proxy copies it into a request header
 * for server code and remembers it in a cookie for the next visit.
 */
export const ADMIN_SITE_PARAM = "site";
export const ADMIN_SITE_HEADER = "x-admin-site";
export const ADMIN_SITE_COOKIE = "admin_site";

const SITE_KEY = /^[a-z0-9_-]{1,20}$/;

export function validSiteKey(value: string | null | undefined): string | null {
  return value && SITE_KEY.test(value) ? value : null;
}

/** Application settings screens that belong to one site. Backup and audit are shared. */
const SITE_SCOPED = /^\/admin\/application(\/(smtp|seo|seo-health|seo-traffic))?\/?$/;

export function isSiteScopedPage(pathname: string): boolean {
  return SITE_SCOPED.test(pathname);
}

export type AdminSite = {
  key: string;
  name: string;
  origin: string | null;
  control: boolean;
};
