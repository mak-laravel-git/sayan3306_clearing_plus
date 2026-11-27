import { TeamScreen } from "@/components/club/team-screen";
import { hasPermission, requirePermission } from "@/lib/auth/dal";
import { getOwnClub, listClubMembers } from "@/lib/clubs/club";

export default async function ClubTeamPage() {
  const user = await requirePermission("club.staff.view", "club");
  const [members, club] = await Promise.all([listClubMembers(), getOwnClub()]);

  // The domains new people must use: those of the club's official email. The API enforces it.
  const domain = club.official_email?.split("@")[1]?.toLowerCase();
  const freeMail = ["gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com", "proton.me", "aol.com"];

  return (
    <TeamScreen
      members={members}
      canManage={hasPermission(user, "club.staff.manage")}
      me={{ email: user.email, isOwner: club.membership?.is_owner ?? false }}
      officialDomains={domain && !freeMail.includes(domain) ? [domain] : []}
    />
  );
}
