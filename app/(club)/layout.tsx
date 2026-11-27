import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ClubUnavailable } from "@/components/club/club-unavailable";
import { PortalFrame } from "@/components/portal/portal-frame";
import { requirePortal } from "@/lib/auth/dal";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * The club dashboard. Another role gets a 403, a guest goes to the login
 * page. A club person whose club is not active (suspended, or no membership)
 * sees why instead of pages that would only fail: the API refuses them anyway.
 */
export default async function ClubLayout({ children }: { children: ReactNode }) {
  const user = await requirePortal("club");
  const usable = user.club?.status === "active";

  return (
    <PortalFrame user={user} portalKey="club">
      {usable ? children : <ClubUnavailable club={user.club} />}
    </PortalFrame>
  );
}
