"use server";

import { revalidatePath } from "next/cache";

import { toResult, type ActionResult } from "@/lib/actions/result";
import {
  changeClubPersonRole,
  handClubOver,
  inviteClubPerson,
  reinstateClub,
  removeClubPerson,
  reviewClub,
  saveClubSettings,
  saveLeagueFee,
  sendActivationEmail,
  sendActivationEmails,
  suspendClub,
  updateClub,
  type ClubPatch,
  type ClubSettingsPatch,
  type SendResult,
} from "@/lib/admin/clubs";
import { requirePermission } from "@/lib/auth/dal";
import { normalizeClubCode } from "@/lib/clubs/types";

type Role = "club_admin" | "club_user";

const isRole = (value: string): value is Role => value === "club_admin" || value === "club_user";

/**
 * Each action checks the permission again before it calls the API: a server
 * action is a public endpoint, so the page that shows its button proves
 * nothing. The API checks once more.
 */
async function run(permission: string, fallback: string, work: () => Promise<string>, paths: string[] = ["/admin/clubs"]): Promise<ActionResult> {
  try {
    await requirePermission(permission, "admin");
    const message = await work();
    paths.forEach((path) => revalidatePath(path));

    return { ok: true, message };
  } catch (error) {
    return toResult(error, fallback);
  }
}

const REASONS: Record<string, string> = {
  not_pre_registered: "not waiting for activation",
  do_not_contact: "asked not to be contacted",
  no_valid_email: "no usable email",
  already_sent: "already emailed",
};

function describe(result: SendResult): string {
  const skipped = Object.entries(result.skipped)
    .map(([reason, count]) => `${count} ${REASONS[reason] ?? reason}`)
    .join(", ");

  return `${result.queued} activation email${result.queued === 1 ? " is" : "s are"} on the way${result.queued > 1 ? ", spread out over a few minutes" : ""}.${skipped ? ` Skipped: ${skipped}.` : ""}`;
}

const pageOf = (code: string) => [`/admin/clubs/${code}`, "/admin/clubs"];

export async function sendActivationEmailAction(code: string, resend = false): Promise<ActionResult> {
  const club = normalizeClubCode(code);
  if (club === null) return { ok: false, message: "Unknown club." };

  return run("clubs.activation.send", "Unable to send the email.", async () => describe(await sendActivationEmail(club, resend)), pageOf(club));
}

export async function sendActivationEmailsAction(codes: string[], resend = false): Promise<ActionResult> {
  const valid = codes.map(normalizeClubCode).filter((code): code is string => code !== null);
  if (valid.length === 0) return { ok: false, message: "Choose at least one club." };

  return run("clubs.activation.send", "Unable to send the emails.", async () => describe(await sendActivationEmails(valid, resend)));
}

export async function saveClubAction(code: string, patch: ClubPatch): Promise<ActionResult> {
  const club = normalizeClubCode(code);
  if (club === null) return { ok: false, message: "Unknown club." };

  return run("clubs.manage", "Unable to save the club.", async () => {
    await updateClub(club, patch);
    return "Club saved.";
  }, pageOf(club));
}

export async function reviewClubAction(code: string): Promise<ActionResult> {
  const club = normalizeClubCode(code);
  if (club === null) return { ok: false, message: "Unknown club." };

  return run("clubs.manage", "Unable to mark the activation as checked.", async () => {
    await reviewClub(club);
    return "Activation marked as checked.";
  }, pageOf(club));
}

export async function suspendClubAction(code: string, reason: string): Promise<ActionResult> {
  const club = normalizeClubCode(code);
  if (club === null) return { ok: false, message: "Unknown club." };
  if (reason.trim() === "") return { ok: false, message: "Say why the club is suspended." };

  return run("clubs.suspend", "Unable to suspend the club.", async () => {
    await suspendClub(club, reason.trim());
    return "Club suspended. Everyone in it was signed out.";
  }, pageOf(club));
}

export async function reinstateClubAction(code: string): Promise<ActionResult> {
  const club = normalizeClubCode(code);
  if (club === null) return { ok: false, message: "Unknown club." };

  return run("clubs.suspend", "Unable to reinstate the club.", async () => {
    await reinstateClub(club);
    return "Club reinstated.";
  }, pageOf(club));
}

export async function invitePersonAction(code: string, input: { name: string; email: string; role: string }): Promise<ActionResult> {
  const club = normalizeClubCode(code);
  if (club === null) return { ok: false, message: "Unknown club." };
  if (!isRole(input.role)) return { ok: false, message: "Choose a role." };
  const role = input.role;

  return run("clubs.manage", "Unable to send the invitation.", async () => {
    await inviteClubPerson(club, { name: input.name.trim(), email: input.email.trim(), role });
    return "Invitation sent.";
  }, pageOf(club));
}

export async function changePersonRoleAction(code: string, memberId: number, role: string): Promise<ActionResult> {
  const club = normalizeClubCode(code);
  if (club === null) return { ok: false, message: "Unknown club." };
  if (!isRole(role)) return { ok: false, message: "Choose a role." };

  return run("clubs.manage", "Unable to change the role.", async () => {
    await changeClubPersonRole(club, memberId, role);
    return "Role saved.";
  }, pageOf(club));
}

export async function removePersonAction(code: string, memberId: number): Promise<ActionResult> {
  const club = normalizeClubCode(code);
  if (club === null) return { ok: false, message: "Unknown club." };

  return run("clubs.manage", "Unable to remove this person.", async () => {
    await removeClubPerson(club, memberId);
    return "Removed from the club. Their sessions ended.";
  }, pageOf(club));
}

export async function handClubOverAction(code: string, memberId: number): Promise<ActionResult> {
  const club = normalizeClubCode(code);
  if (club === null) return { ok: false, message: "Unknown club." };

  return run("clubs.manage", "Unable to hand the club over.", async () => {
    await handClubOver(club, memberId);
    return "The club has a new owner.";
  }, pageOf(club));
}

export async function saveClubSettingsAction(patch: ClubSettingsPatch): Promise<ActionResult> {
  return run("clubs.settings.manage", "Unable to save the club settings.", async () => {
    await saveClubSettings(patch);
    return "Club settings saved.";
  }, ["/admin/clubs/settings"]);
}

export async function saveLeagueFeeAction(id: number, pounds: string): Promise<ActionResult> {
  const trimmed = pounds.trim();
  const amount = trimmed === "" ? null : Math.round(Number(trimmed.replace(/[£,\s]/g, "")) * 100);

  if (amount !== null && (!Number.isFinite(amount) || amount < 0)) return { ok: false, message: "Enter the fee in pounds, for example 4000." };

  return run("clubs.settings.manage", "Unable to save the fee.", async () => {
    await saveLeagueFee(id, amount);
    return amount === null ? "Fee cleared." : "Licence fee saved. Clubs that already activated keep the amount recorded for them.";
  }, ["/admin/clubs/settings"]);
}
