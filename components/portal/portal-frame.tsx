import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { PortalShell } from "@/components/portal/portal-shell";
import { logoutAction } from "@/lib/actions/logout";
import { fetchPublicSettings } from "@/lib/settings/public";
import { SIDEBAR_COOKIE_NAME } from "@/lib/sidebar-state";
import type { PortalKey, User } from "@/types/auth";

/**
 * The server half of every dashboard: it receives the person the layout has
 * already checked and puts the shell around the page. It does no checking of
 * its own, so a layout cannot forget to call `requirePortal` and still look fine.
 */
export async function PortalFrame({
  user,
  portalKey,
  children,
}: {
  user: User;
  portalKey: PortalKey | null;
  children: ReactNode;
}) {
  const sidebar = (await cookies()).get(SIDEBAR_COOKIE_NAME)?.value;
  const settings = await fetchPublicSettings();

  return (
    <PortalShell
      user={user}
      portalKey={portalKey}
      onLogout={logoutAction}
      defaultOpen={sidebar !== "false"}
      brandLabel={settings.short_name}
      logoUrl={settings.logo_url}
    >
      {children}
    </PortalShell>
  );
}
