"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { ADMIN_SITE_COOKIE } from "@/lib/admin/site";
import { getAdminSites } from "@/lib/admin/sites";
import { getSession } from "@/lib/auth/auth-cookies";

export type SelectSiteResult = { ok: true } | { ok: false; message: string };

/**
 * Remembers which site the admin is editing. Only a site the API lists for
 * this admin is accepted; the API checks again on every call.
 */
export async function selectAdminSiteAction(key: string): Promise<SelectSiteResult> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { ok: false, message: "You do not have permission to switch sites." };
  }

  const sites = await getAdminSites();
  if (!sites.some((site) => site.key === key)) {
    return { ok: false, message: "That site does not exist." };
  }

  (await cookies()).set(ADMIN_SITE_COOKIE, key, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/admin/application", "layout");
  return { ok: true };
}
