"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment, type ReactNode } from "react";

import { ADMIN_SITE_PARAM, isSiteScopedPage, validSiteKey, type AdminSite } from "@/lib/admin/site-keys";
import { cn } from "@/lib/utils";

/**
 * The settings forms keep what the admin typed in their own state, so when the
 * site in the URL changes they must start over with the new site's data. Keying
 * the page by the site makes React build the forms again (a plain re-render
 * would keep the old site's values on screen until a reload).
 */
export function SiteKeyed({ children }: { children: ReactNode }) {
  const site = validSiteKey(useSearchParams().get(ADMIN_SITE_PARAM)) ?? "default";

  return <Fragment key={site}>{children}</Fragment>;
}

function hostOf(origin: string | null): string {
  if (!origin) return "";
  try {
    return new URL(origin).host;
  } catch {
    return origin;
  }
}

/**
 * Tabs above the settings of one site. Each tab is a link to the same screen
 * with `?site=` in the URL, so a page can be bookmarked or shared for one site
 * and the browser's back button moves between sites. Screens shared by every
 * site (backup, audit) show no tabs.
 */
export function SiteTabs({ sites, fallback }: { sites: AdminSite[]; fallback: AdminSite }) {
  const pathname = usePathname();
  // The layout is not re-rendered when only the query changes, so the URL is the source of truth here.
  const chosen = validSiteKey(useSearchParams().get(ADMIN_SITE_PARAM));
  const current = sites.find((site) => site.key === chosen) ?? fallback;

  if (!isSiteScopedPage(pathname) || sites.length < 2) return null;

  return (
    <nav aria-label="Site" className="-mb-2 flex flex-col gap-3 border-b sm:flex-row sm:items-end sm:justify-between">
      <ul className="flex flex-wrap gap-1">
        {sites.map((site) => {
          const active = site.key === current.key;

          return (
            <li key={site.key}>
              <Link
                href={`${pathname}?${ADMIN_SITE_PARAM}=${encodeURIComponent(site.key)}`}
                aria-current={active ? "page" : undefined}
                scroll={false}
                className={cn(
                  "-mb-px flex items-center gap-3 border-b-2 px-4 py-3 transition-colors outline-none focus-visible:bg-muted",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {site.name.slice(0, 1)}
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-medium">{site.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{hostOf(site.origin)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="pb-3 text-xs text-muted-foreground">
        {pathname.startsWith("/admin/application/smtp")
          ? `The mail server is shared. The sender is saved for ${current.name}.`
          : `Everything below is saved for ${current.name} only.`}
      </p>
    </nav>
  );
}
