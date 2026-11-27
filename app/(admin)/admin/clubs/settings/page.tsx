import { ClubSettingsScreen } from "@/components/admin/clubs/club-settings-screen";
import { getClubSettings, listLeagueFees } from "@/lib/admin/clubs";
import { requirePermission } from "@/lib/auth/dal";

export default async function ClubSettingsPage() {
  await requirePermission("clubs.settings.manage", "admin");

  const [{ settings }, leagues] = await Promise.all([getClubSettings(), listLeagueFees()]);

  return <ClubSettingsScreen settings={settings} leagues={leagues} />;
}
