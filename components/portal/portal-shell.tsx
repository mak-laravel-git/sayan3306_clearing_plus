"use client";

import { Globe, History, LogOut, MonitorSmartphone, Settings, Shield, ShieldCheck, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo, type ReactNode } from "react";

import { AppContent } from "@/components/layout/app-content";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { HeaderUser } from "@/components/nav/header-user";
import { SidebarPromo } from "@/components/nav/sidebar-promo";
import { useTransitionController } from "@/components/transitions/transition-provider";
import { TimezoneProvider } from "@/lib/datetime/timezone";
import { ACCOUNT_HOME, PORTALS, isAccountPath, portalOfPath } from "@/lib/auth/portals";
import type { BreadcrumbItem, UserMenuGroup, UserSummary } from "@/lib/nav";
import { navFor } from "@/lib/nav/portal-nav";
import type { PortalKey, User } from "@/types/auth";

const ACCOUNT_SECTIONS: [string, string][] = [
  ["/account/profile", "Profile"],
  ["/account/security", "Security"],
  ["/account/devices", "Devices"],
  ["/account/activity", "My activity"],
  ["/account/settings", "Settings"],
];

const ADMIN_SECTIONS: [string, string][] = [
  ["/admin/users", "Users & roles"],
  ["/admin/realtime", "Realtime"],
  ["/admin/media", "Media"],
  ["/admin/application/smtp", "SMTP"],
  ["/admin/application/seo-health", "SEO health"],
  ["/admin/application/seo-traffic", "Site traffic"],
  ["/admin/application/seo", "SEO"],
  ["/admin/application/security", "Security policy"],
  ["/admin/application/backup", "Database backup"],
  ["/admin/application/audit", "Audit"],
];

function breadcrumbsFor(pathname: string, home: { title: string; href: string }): BreadcrumbItem[] {
  if (isAccountPath(pathname)) {
    const section = ACCOUNT_SECTIONS.find(([prefix]) => pathname.startsWith(prefix))?.[1];
    return [{ title: home.title, href: home.href }, { title: "Account", href: ACCOUNT_HOME }, ...(section ? [{ title: section }] : [])];
  }

  if (pathname.startsWith("/admin/application")) {
    const section = ADMIN_SECTIONS.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "General";
    return [
      { title: home.title, href: home.href },
      { title: "Application settings", href: "/admin/application" },
      { title: section },
    ];
  }

  const section = ADMIN_SECTIONS.find(([prefix]) => pathname.startsWith(prefix))?.[1];
  return section ? [{ title: home.title, href: home.href }, { title: section }] : [{ title: home.title }];
}

/**
 * One shell for every dashboard. Which menu and which brand label it shows
 * follow the person's role; the pages and the API still refuse what the role
 * may not open.
 */
export function PortalShell({
  user,
  portalKey,
  onLogout,
  defaultOpen = true,
  brandLabel = "Clearing+",
  logoUrl = null,
  children,
}: {
  user: User;
  /** The dashboard this shell belongs to; null for an account without a role. */
  portalKey: PortalKey | null;
  onLogout: () => void | Promise<void>;
  defaultOpen?: boolean;
  brandLabel?: string;
  logoUrl?: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { runTransitionAction } = useTransitionController();

  const portal = portalKey ? PORTALS[portalKey] : portalOfPath(pathname);
  const home = { title: portal?.label ?? "Account", href: portal?.home ?? ACCOUNT_HOME };

  const summary: UserSummary = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    timezone: user.timezone,
  };

  const menu = useMemo<UserMenuGroup[]>(
    () => [
      {
        label: "Account",
        items: [
          { title: "Profile", href: "/account/profile", icon: UserRound },
          { title: "Security", href: "/account/security", icon: Shield },
          { title: "Devices", href: "/account/devices", icon: MonitorSmartphone },
          { title: "My activity", href: "/account/activity", icon: History },
          { title: "Settings", href: "/account/settings", icon: Settings },
        ],
      },
      {
        label: "Session",
        items: [
          {
            title: "Log out",
            icon: LogOut,
            variant: "destructive",
            onSelect: () => {
              void runTransitionAction(onLogout);
            },
          },
        ],
      },
    ],
    [onLogout, runTransitionAction],
  );

  // Cheap to build, and it depends on the person's current permissions, so it is not memoized.
  const groups = navFor(portal?.key ?? null, user);

  return (
    <AppShell defaultOpen={defaultOpen}>
      <AppSidebar
        brand={{
          href: home.href,
          label: `${brandLabel}`,
          icon: logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- brand file is served from this app
            <img src={logoUrl} alt="" className="size-4 rounded-sm object-contain" />
          ) : (
            <ShieldCheck className="size-4" />
          ),
        }}
        groups={groups}
        promo={
          <SidebarPromo
            title={home.title}
            description="The public site stays separate from your workspace."
            href="/"
            action="Open site"
            icon={Globe}
          />
        }
        user={summary}
        menu={menu}
      />
      <AppContent
        header={
          <AppHeader
            breadcrumbs={breadcrumbsFor(pathname, home)}
            actions={<HeaderUser user={summary} groups={menu} />}
          />
        }
      >
        <TimezoneProvider preference={user.timezone}>{children}</TimezoneProvider>
      </AppContent>
    </AppShell>
  );
}
