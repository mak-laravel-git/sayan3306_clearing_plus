import { ProfileForm } from "@/components/club/profile-form";
import { hasPermission, requirePermission } from "@/lib/auth/dal";
import { getOwnClub } from "@/lib/clubs/club";

export default async function ClubProfilePage() {
  const user = await requirePermission("club.view", "club");
  const club = await getOwnClub();

  return <ProfileForm club={club} canEdit={hasPermission(user, "club.profile.update")} />;
}
