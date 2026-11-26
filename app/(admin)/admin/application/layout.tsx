import type { ReactNode } from "react";

import { SiteTabs } from "@/components/admin/application/site-tabs";
import { RouteReady } from "@/components/transitions/route-ready";
import { currentAdminSite, getAdminSites } from "@/lib/admin/sites";
import { requirePermission } from "@/lib/auth/dal";

export default async function ApplicationSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Application settings belong to the platform admin only.
  await requirePermission("application.settings.manage", "admin");

  const sites = await getAdminSites();
  const current = await currentAdminSite(sites);

  return (
    <div className="flex w-full flex-col gap-6">
      <RouteReady />
      {current ? <SiteTabs sites={sites} fallback={current} /> : null}
      {children}
    </div>
  );
}
