import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { SiteBar } from "@/components/admin/application/site-bar";
import { RouteReady } from "@/components/transitions/route-ready";
import { currentAdminSite, getAdminSites } from "@/lib/admin/sites";
import { getSession } from "@/lib/auth/auth-cookies";

export default async function ApplicationSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/admin");

  const sites = await getAdminSites();
  const current = await currentAdminSite(sites);

  return (
    <div className="flex w-full flex-col gap-6">
      <RouteReady />
      {current ? <SiteBar sites={sites} current={current} /> : null}
      {children}
    </div>
  );
}
