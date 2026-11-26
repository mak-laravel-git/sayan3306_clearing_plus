import {
  Activity,
  BarChart3,
  Database,
  FileSearch,
  Handshake,
  History,
  Images,
  LayoutDashboard,
  Mail,
  MonitorSmartphone,
  Radio,
  ScrollText,
  Search,
  Settings,
  Settings2,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Users,
} from "lucide-react";

import { modules } from "@/lib/modules";
import type { NavGroup, NavItem } from "@/lib/nav";
import type { PortalKey, User } from "@/types/auth";

/**
 * The menu of each dashboard. This module has no server-only imports because
 * the sidebar is a client component. An item can name the permission it needs;
 * it is left out when the person lacks it. That only keeps the menu tidy: the
 * page and the API refuse the person anyway.
 */
type Item = NavItem & { enabled?: boolean; permission?: string; children?: Item[] };

const account: NavGroup = {
  label: "Account",
  items: [
    { title: "Profile", href: "/account/profile", icon: UserRound },
    { title: "Security", href: "/account/security", icon: Shield },
    { title: "Devices", href: "/account/devices", icon: MonitorSmartphone },
    { title: "My activity", href: "/account/activity", icon: History },
    { title: "Settings", href: "/account/settings", icon: Settings },
  ],
};

const adminGroups: { label: string; items: Item[] }[] = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { title: "Users & roles", href: "/admin/users", icon: Users, permission: "users.view" },
      { title: "Realtime", href: "/admin/realtime", icon: Radio, enabled: modules.realtime, permission: "realtime.diagnose" },
      { title: "Media", href: "/admin/media", icon: Images, enabled: modules.media, permission: "media.manage" },
    ],
  },
  {
    label: "Application",
    items: [
      {
        title: "Application settings",
        href: "/admin/application",
        icon: SlidersHorizontal,
        permission: "application.settings.manage",
        children: [
          { title: "General", href: "/admin/application", icon: Settings2 },
          { title: "SMTP", href: "/admin/application/smtp", icon: Mail },
          { title: "SEO", href: "/admin/application/seo", icon: Search, permission: "application.seo.manage" },
          { title: "SEO health", href: "/admin/application/seo-health", icon: Activity, enabled: modules.seoHealth, permission: "application.seo.manage" },
          { title: "Site traffic", href: "/admin/application/seo-traffic", icon: BarChart3, enabled: modules.seoTraffic, permission: "application.traffic.view" },
          { title: "Security policy", href: "/admin/application/security", icon: ShieldCheck, permission: "security.policy.manage" },
          { title: "Database backup", href: "/admin/application/backup", icon: Database, enabled: modules.backups, permission: "application.backups.manage" },
          { title: "Audit", href: "/admin/application/audit", icon: ScrollText, enabled: modules.audit, permission: "application.audit.view" },
        ],
      },
    ],
  },
];

/** The other dashboards start with their home page; their features arrive with their own steps. */
const simpleGroups: Record<Exclude<PortalKey, "admin">, { label: string; items: Item[] }[]> = {
  ppm: [{ label: "Workspace", items: [{ title: "Dashboard", href: "/ppm", icon: LayoutDashboard }] }],
  player: [{ label: "Workspace", items: [{ title: "Dashboard", href: "/player", icon: LayoutDashboard }] }],
  guardian: [{ label: "Workspace", items: [{ title: "Dashboard", href: "/guardian", icon: LayoutDashboard }] }],
  club: [
    {
      label: "Workspace",
      items: [
        { title: "Dashboard", href: "/club", icon: LayoutDashboard },
        { title: "Player search", href: "/club", icon: FileSearch, enabled: false },
        { title: "Claims", href: "/club", icon: Handshake, enabled: false },
      ],
    },
  ],
  employer: [{ label: "Workspace", items: [{ title: "Dashboard", href: "/employer", icon: LayoutDashboard }] }],
};

function keep(items: Item[], permissions: readonly string[]): NavItem[] {
  return items
    .filter((item) => item.enabled !== false)
    .filter((item) => item.permission === undefined || permissions.includes(item.permission))
    .map(({ enabled, permission, children, ...rest }) => {
      void enabled;
      void permission;

      return { ...rest, ...(children ? { children: keep(children, permissions) } : {}) };
    })
    // A parent whose children were all removed has nothing left to open.
    .filter((item) => item.children === undefined || item.children.length > 0);
}

/** The groups of one person's menu: their dashboard, then their own account. */
export function navFor(portal: PortalKey | null, user: Pick<User, "permissions">): NavGroup[] {
  if (portal === null) return [account];

  const groups = portal === "admin" ? adminGroups : simpleGroups[portal];

  return [
    ...groups.map((group) => ({ label: group.label, items: keep(group.items, user.permissions) })).filter((group) => group.items.length > 0),
    account,
  ];
}
