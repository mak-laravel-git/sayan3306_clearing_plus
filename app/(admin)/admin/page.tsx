import { DashboardHome } from "@/components/admin/dashboard-home";
import { getStatsOrNull } from "@/lib/admin/stats";
import { getCurrentUser, hasPermission } from "@/lib/auth/dal";
import { RouteReady } from "@/components/transitions/route-ready";

export default async function AdminDashboardPage() {
  // The layout already refused anyone who is not a platform admin.
  const user = await getCurrentUser();
  const canAudit = user !== null && hasPermission(user, "application.audit.view");
  const canMedia = user !== null && hasPermission(user, "media.manage");

  const [audit, media] = await Promise.all([
    canAudit ? getStatsOrNull("audit") : null,
    canMedia ? getStatsOrNull("media") : null,
  ]);

  return (
    <>
      <RouteReady />
      <DashboardHome user={user ?? undefined} stats={{ audit, media, personal: null }} />
    </>
  );
}
