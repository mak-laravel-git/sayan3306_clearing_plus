"use server";

import { revalidatePath } from "next/cache";

import { toResult } from "@/lib/actions/result";
import {
  changeRole,
  createUser,
  reinstateUser,
  resendInvitation,
  setExtraPpm,
  suspendUser,
  ROLE_OPTIONS,
} from "@/lib/admin/users";
import { requirePermission } from "@/lib/auth/dal";
import type { UserRole } from "@/types/auth";

export type UsersResult = { ok: true; message: string } | { ok: false; message: string };

const ROLES = new Set<string>(ROLE_OPTIONS.map((option) => option.value));

/**
 * Each action checks the permission again before it calls the API: a server
 * action is a public endpoint, so the page that shows its button proves
 * nothing. The API checks once more.
 */
async function run(permission: string, fallback: string, work: () => Promise<string>): Promise<UsersResult> {
  try {
    await requirePermission(permission, "admin");
    const message = await work();
    revalidatePath("/admin/users");
    return { ok: true, message };
  } catch (error) {
    return toResult(error, fallback);
  }
}

export async function createUserAction(input: { name: string; email: string; role: string }): Promise<UsersResult> {
  if (!ROLES.has(input.role)) return { ok: false, message: "Choose a role." };

  return run("users.manage", "Unable to create the account.", async () => {
    await createUser({ name: input.name.trim(), email: input.email.trim(), role: input.role as UserRole });
    return "Account created. An invitation with a code was emailed.";
  });
}

export async function changeRoleAction(id: string | number, role: string): Promise<UsersResult> {
  if (!ROLES.has(role)) return { ok: false, message: "Choose a role." };

  return run("roles.assign", "Unable to change the role.", async () => {
    await changeRole(id, role as UserRole);
    return "Role saved.";
  });
}

export async function setExtraPpmAction(id: string | number, enabled: boolean): Promise<UsersResult> {
  return run("roles.assign", "Unable to save.", async () => {
    await setExtraPpm(id, enabled);
    return enabled ? "This admin can now also work as a PPM." : "The PPM role was removed.";
  });
}

export async function suspendUserAction(id: string | number): Promise<UsersResult> {
  return run("users.manage", "Unable to suspend the account.", async () => {
    await suspendUser(id);
    return "Account suspended. Every session of this account ended.";
  });
}

export async function reinstateUserAction(id: string | number): Promise<UsersResult> {
  return run("users.manage", "Unable to reinstate the account.", async () => {
    await reinstateUser(id);
    return "Account reinstated.";
  });
}

export async function resendInvitationAction(id: string | number): Promise<UsersResult> {
  return run("users.manage", "Unable to send the invitation.", async () => {
    await resendInvitation(id);
    return "Invitation sent again.";
  });
}
