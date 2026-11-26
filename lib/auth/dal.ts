import "server-only";

import { forbidden, redirect } from "next/navigation";
import { cache } from "react";

import { ACCOUNT_HOME, PORTALS, portalForRole } from "@/lib/auth/portals";
import { fetchLaravelUser } from "@/lib/auth/api";
import { getSession } from "@/lib/auth/auth-cookies";
import { ApiError } from "@/lib/auth/api-error";
import { logoutUrl } from "@/lib/auth/session-expired";
import type { PortalKey, User } from "@/types/auth";

/**
 * The data access layer for who is signed in. The session cookie only proves
 * a session exists; the role in it may be old (an admin can change it at any
 * time). So every dashboard asks the API who this is right now, once per
 * request, and decides from that. The API still checks every call it serves.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSession();
  if (!session?.accessToken) return null;

  try {
    return await fetchLaravelUser(session.accessToken);
  } catch (error) {
    // The API ended the session (token revoked, idle too long, role no longer served here).
    if (error instanceof ApiError && error.status === 401) {
      redirect(logoutUrl());
    }
    throw error;
  }
});

/** Any signed-in person; a guest goes to the login page. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(logoutUrl());
  return user;
}

/**
 * The person must work in this dashboard. A guest goes to the login page; a
 * signed-in person with another role gets a 403. A role that must set up
 * two-factor is sent to do that first.
 */
export async function requirePortal(key: PortalKey): Promise<User> {
  const user = await requireUser();
  const portal = PORTALS[key];

  if (!user.role || !portal.roles.includes(user.role)) {
    forbidden();
  }

  if (user.requirements?.two_factor_setup_needed) {
    redirect(`${ACCOUNT_HOME.replace("profile", "security")}?setup=required`);
  }

  return user;
}

/** A single right inside a dashboard (for example `users.manage`). */
export async function requirePermission(permission: string, portal: PortalKey): Promise<User> {
  const user = await requirePortal(portal);

  if (!user.permissions.includes(permission)) {
    forbidden();
  }

  return user;
}

export function hasPermission(user: Pick<User, "permissions">, permission: string): boolean {
  return user.permissions.includes(permission);
}

export function homeOf(user: Pick<User, "role">): string {
  return portalForRole(user.role)?.home ?? ACCOUNT_HOME;
}
