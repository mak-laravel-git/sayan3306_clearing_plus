import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PortalFrame } from "@/components/portal/portal-frame";
import { requirePortal } from "@/lib/auth/dal";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** The platform admin's dashboard. Anyone else gets a 403, a guest goes to the login page. */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requirePortal("admin");

  return (
    <PortalFrame user={user} portalKey="admin">
      {children}
    </PortalFrame>
  );
}
