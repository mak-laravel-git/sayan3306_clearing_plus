import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { PortalFrame } from "@/components/portal/portal-frame";
import { requireUser } from "@/lib/auth/dal";
import { portalForRole } from "@/lib/auth/portals";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const SECURITY_PAGE = "/account/security";

/**
 * Every signed-in person's own account: profile, security, devices, activity,
 * settings. It is open to every role, so this layout does not look at roles.
 * A role that must use two-factor can only see the security page until it is
 * set up (the API closes everything else for it).
 */
export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  if (user.requirements?.two_factor_setup_needed) {
    const pathname = (await headers()).get("x-pathname");
    if (pathname !== SECURITY_PAGE) redirect(`${SECURITY_PAGE}?setup=required`);
  }

  return (
    <PortalFrame user={user} portalKey={portalForRole(user.role)?.key ?? null}>
      {children}
    </PortalFrame>
  );
}
