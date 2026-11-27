import "server-only";

import { authedRequest } from "@/lib/auth/api";
import type { ClubMember, ClubTermsText, OwnClub } from "@/lib/clubs/types";

/**
 * The signed-in person's own club. There is no club in any path or argument:
 * the API takes it from the person's membership, so nobody can ask for
 * another club.
 */
export async function getOwnClub(): Promise<OwnClub> {
  return (await authedRequest<{ club: OwnClub }>("get", "/club")).club;
}

export type ProfileInput = {
  contact_name: string | null;
  key_contact_role: string | null;
  phone: string | null;
  website: string | null;
};

export async function updateOwnClub(input: ProfileInput): Promise<OwnClub> {
  return (await authedRequest<{ club: OwnClub }>("put", "/club/profile", input)).club;
}

export async function getClubTerms(): Promise<ClubTermsText & { accepted: boolean }> {
  return (await authedRequest<{ terms: ClubTermsText & { accepted: boolean } }>("get", "/club/terms")).terms;
}

export async function acceptClubTerms(version: string): Promise<void> {
  await authedRequest<null>("post", "/club/terms/accept", { version });
}

export async function listClubMembers(): Promise<ClubMember[]> {
  return (await authedRequest<{ members: ClubMember[] }>("get", "/club/members")).members;
}

export async function inviteClubMember(input: { name: string; email: string; role: "club_admin" | "club_user" }): Promise<void> {
  await authedRequest<unknown>("post", "/club/members", input);
}

export async function changeClubMemberRole(id: number, role: "club_admin" | "club_user"): Promise<void> {
  await authedRequest<unknown>("put", `/club/members/${id}/role`, { role });
}

export async function removeClubMember(id: number): Promise<void> {
  await authedRequest<null>("delete", `/club/members/${id}`);
}

export async function resendClubInvitation(id: number): Promise<void> {
  await authedRequest<null>("post", `/club/members/${id}/resend-invitation`);
}

export async function transferClubOwnership(memberId: number): Promise<void> {
  await authedRequest<null>("post", "/club/owner", { member_id: memberId });
}
