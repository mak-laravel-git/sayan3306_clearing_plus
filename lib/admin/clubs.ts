import "server-only";

import { authedRequest } from "@/lib/auth/api";
import type { AdminClubDetail, AdminClubList, ClubSettingsValues, LeagueFee } from "@/lib/clubs/types";

export type ClubFilters = {
  q?: string;
  status?: string;
  email_status?: string;
  continent?: string;
  country?: string;
  unreviewed?: boolean;
  emailed?: "yes" | "no" | "";
  page?: number;
};

/** The list the API returns for these filters (also the query of the CSV export). */
export function clubQuery(filters: ClubFilters, extra: Record<string, string> = {}): URLSearchParams {
  const params = new URLSearchParams(extra);

  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.status) params.set("status", filters.status);
  if (filters.email_status) params.set("email_status", filters.email_status);
  if (filters.continent) params.set("continent", filters.continent);
  if (filters.country) params.set("country", filters.country);
  if (filters.unreviewed) params.set("unreviewed", "1");
  if (filters.emailed) params.set("emailed", filters.emailed === "yes" ? "1" : "0");

  return params;
}

export async function listClubs(filters: ClubFilters): Promise<AdminClubList> {
  const params = clubQuery(filters, { per_page: "25", page: String(filters.page ?? 1) });

  return authedRequest<AdminClubList>("get", `/admin/clubs?${params.toString()}`);
}

export async function getClubDetail(code: string): Promise<AdminClubDetail> {
  return (await authedRequest<{ club: AdminClubDetail }>("get", `/admin/clubs/${encodeURIComponent(code)}`)).club;
}

export type ClubPatch = {
  official_email?: string | null;
  contact_name?: string | null;
  key_contact_role?: string | null;
  phone?: string | null;
  website?: string | null;
  do_not_contact?: boolean;
};

export async function updateClub(code: string, patch: ClubPatch): Promise<AdminClubDetail> {
  return (await authedRequest<{ club: AdminClubDetail }>("put", `/admin/clubs/${encodeURIComponent(code)}`, patch)).club;
}

export type SendResult = { queued: number; skipped: Record<string, number>; unknown?: number };

export async function sendActivationEmail(code: string, resend: boolean): Promise<SendResult> {
  return authedRequest<SendResult>("post", `/admin/clubs/${encodeURIComponent(code)}/activation-email`, { resend });
}

export async function sendActivationEmails(codes: string[], resend: boolean): Promise<SendResult> {
  return authedRequest<SendResult>("post", "/admin/clubs/activation-emails", { codes, resend });
}

export async function reviewClub(code: string): Promise<void> {
  await authedRequest<unknown>("post", `/admin/clubs/${encodeURIComponent(code)}/review`);
}

export async function suspendClub(code: string, reason: string): Promise<void> {
  await authedRequest<unknown>("post", `/admin/clubs/${encodeURIComponent(code)}/suspend`, { reason });
}

export async function reinstateClub(code: string): Promise<void> {
  await authedRequest<unknown>("post", `/admin/clubs/${encodeURIComponent(code)}/reinstate`);
}

export async function inviteClubPerson(code: string, input: { name: string; email: string; role: "club_admin" | "club_user" }): Promise<void> {
  await authedRequest<unknown>("post", `/admin/clubs/${encodeURIComponent(code)}/members`, input);
}

export async function changeClubPersonRole(code: string, memberId: number, role: "club_admin" | "club_user"): Promise<void> {
  await authedRequest<unknown>("put", `/admin/clubs/${encodeURIComponent(code)}/members/${memberId}/role`, { role });
}

export async function removeClubPerson(code: string, memberId: number): Promise<void> {
  await authedRequest<null>("delete", `/admin/clubs/${encodeURIComponent(code)}/members/${memberId}`);
}

export async function handClubOver(code: string, memberId: number): Promise<void> {
  await authedRequest<null>("post", `/admin/clubs/${encodeURIComponent(code)}/owner`, { member_id: memberId });
}

export async function getClubSettings(): Promise<{ settings: ClubSettingsValues; leagues_without_fee: number }> {
  return authedRequest("get", "/admin/club-settings");
}

export type ClubSettingsPatch = {
  founding_deadline?: string;
  claim_credit_minor?: number;
  claim_credit_valid_days?: number;
  official_launch_date?: string | null;
  activation_emails_enabled?: boolean;
};

export async function saveClubSettings(patch: ClubSettingsPatch): Promise<ClubSettingsValues> {
  return (await authedRequest<{ settings: ClubSettingsValues }>("put", "/admin/club-settings", patch)).settings;
}

export async function listLeagueFees(): Promise<LeagueFee[]> {
  return (await authedRequest<{ leagues: LeagueFee[] }>("get", "/admin/club-settings/leagues")).leagues;
}

export async function saveLeagueFee(id: number, minor: number | null): Promise<void> {
  await authedRequest<unknown>("put", `/admin/club-settings/leagues/${id}`, { licence_fee_minor: minor });
}
