"use server";

import { revalidatePath } from "next/cache";

import { toResult, type ActionResult } from "@/lib/actions/result";
import { requirePermission } from "@/lib/auth/dal";
import {
  changeClubMemberRole,
  inviteClubMember,
  removeClubMember,
  resendClubInvitation,
  transferClubOwnership,
} from "@/lib/clubs/club";

type Role = "club_admin" | "club_user";

const isRole = (value: string): value is Role => value === "club_admin" || value === "club_user";

/**
 * Every action checks the permission again before it calls the API: a server
 * action is a public endpoint, so the page that shows its button proves
 * nothing. The API checks once more, and decides which club (the person's own).
 */
async function run(fallback: string, work: () => Promise<string>): Promise<ActionResult> {
  try {
    await requirePermission("club.staff.manage", "club");
    const message = await work();
    revalidatePath("/club/team");
    return { ok: true, message };
  } catch (error) {
    return toResult(error, fallback);
  }
}

export async function inviteMemberAction(input: { name: string; email: string; role: string }): Promise<ActionResult> {
  if (!isRole(input.role)) return { ok: false, message: "Choose a role." };
  const role = input.role;

  return run("Unable to send the invitation.", async () => {
    await inviteClubMember({ name: input.name.trim(), email: input.email.trim(), role });
    return "Invitation sent. They get an email with a code to activate their account.";
  });
}

export async function changeMemberRoleAction(id: number, role: string): Promise<ActionResult> {
  if (!isRole(role)) return { ok: false, message: "Choose a role." };

  return run("Unable to change the role.", async () => {
    await changeClubMemberRole(id, role);
    return "Role saved.";
  });
}

export async function removeMemberAction(id: number): Promise<ActionResult> {
  return run("Unable to remove this person.", async () => {
    await removeClubMember(id);
    return "Removed from the club. Their sessions ended.";
  });
}

export async function resendInvitationAction(id: number): Promise<ActionResult> {
  return run("Unable to send the invitation.", async () => {
    await resendClubInvitation(id);
    return "Invitation sent again.";
  });
}

export async function transferOwnershipAction(id: number): Promise<ActionResult> {
  return run("Unable to hand over the club.", async () => {
    await transferClubOwnership(id);
    return "The club has a new owner.";
  });
}
