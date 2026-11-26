import type { PortalKey, User, UserRole } from "@/types/auth";

/**
 * Every role works in its own dashboard, under its own URL prefix. This is the
 * one table the proxy, the layouts, the sign-in redirect and the menus read, so
 * "who goes where" is written down once. Hiding a link is never the security:
 * the layouts re-check the role and the API checks every call.
 */
export type Portal = {
  key: PortalKey;
  /** URL prefix, no trailing slash. */
  prefix: string;
  /** The page a person lands on after signing in. */
  home: string;
  label: string;
  /** Roles that work in this dashboard. */
  roles: readonly UserRole[];
};

export const PORTALS: Record<PortalKey, Portal> = {
  admin: { key: "admin", prefix: "/admin", home: "/admin", label: "Platform admin", roles: ["platform_admin"] },
  ppm: { key: "ppm", prefix: "/ppm", home: "/ppm", label: "Placement manager", roles: ["ppm"] },
  player: { key: "player", prefix: "/player", home: "/player", label: "Player", roles: ["player"] },
  guardian: { key: "guardian", prefix: "/guardian", home: "/guardian", label: "Guardian", roles: ["guardian"] },
  club: { key: "club", prefix: "/club", home: "/club", label: "Club", roles: ["club_admin", "club_user"] },
  employer: { key: "employer", prefix: "/employer", home: "/employer", label: "Employer", roles: ["employer"] },
};

/** The area every signed-in person has: their own profile, security, devices and activity. */
export const ACCOUNT_PREFIX = "/account";

export const ACCOUNT_HOME = "/account/profile";

const ROLE_PORTAL: Record<UserRole, PortalKey> = {
  platform_admin: "admin",
  ppm: "ppm",
  player: "player",
  guardian: "guardian",
  club_admin: "club",
  club_user: "club",
  employer: "employer",
};

export function portalForRole(role: UserRole | null | undefined): Portal | null {
  return role ? PORTALS[ROLE_PORTAL[role]] : null;
}

export function portalForUser(user: Pick<User, "role">): Portal | null {
  return portalForRole(user.role);
}

/** Where a person goes after signing in. An account without a role has nowhere but its own account area. */
export function homeFor(user: Pick<User, "role">): string {
  return portalForUser(user)?.home ?? ACCOUNT_HOME;
}

/** The portal a path belongs to, or null for the account area and public pages. */
export function portalOfPath(pathname: string): Portal | null {
  return (
    Object.values(PORTALS).find(
      (portal) => pathname === portal.prefix || pathname.startsWith(`${portal.prefix}/`),
    ) ?? null
  );
}

export function isAccountPath(pathname: string): boolean {
  return pathname === ACCOUNT_PREFIX || pathname.startsWith(`${ACCOUNT_PREFIX}/`);
}

/** May this role open this path? The account area is open to everyone signed in. */
export function roleMayOpen(role: UserRole | null, pathname: string): boolean {
  if (isAccountPath(pathname)) return true;

  const portal = portalOfPath(pathname);
  if (portal === null) return true;

  return role !== null && portal.roles.includes(role);
}

/**
 * A `next` value is only honoured when it stays inside the person's own
 * dashboard or account area; otherwise they land on their home.
 */
export function safeNextFor(user: Pick<User, "role">, next: string | null | undefined): string {
  const home = homeFor(user);
  if (!next || next === "/") return home;

  return roleMayOpen(user.role, next) && (isAccountPath(next) || portalOfPath(next) !== null) ? next : home;
}
