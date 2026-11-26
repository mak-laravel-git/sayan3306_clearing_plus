import { ShieldAlert } from "lucide-react";

import {
  AccountPageHeader,
  AccountSection,
} from "@/components/admin/account/account-chrome";
import { RecentActivity } from "@/components/admin/audit/recent-activity";
import { DangerZone } from "@/components/admin/profile/danger-zone";
import { PasswordForm } from "@/components/admin/profile/password-form";
import { TwoFactorSection } from "@/components/admin/profile/two-factor-section";
import { TransitionLink as Link } from "@/components/transitions/transition-link";
import { Button } from "@/components/ui/button";
import { listMyActivity } from "@/lib/admin/audit";
import { requireUser } from "@/lib/auth/dal";
import { RouteReady } from "@/components/transitions/route-ready";

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>;
}) {
  const user = await requireUser();
  const setupRequired = Boolean(user.requirements?.two_factor_setup_needed);
  await searchParams;

  // While two-factor setup is due, the API only answers the two-factor calls; the rest of the page waits.
  const recent = setupRequired
    ? null
    : await listMyActivity({ perPage: 5 }).catch(() => null);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <RouteReady />
      <AccountPageHeader
        active="security"
        title="Security"
        description="Protect the account with a strong password and two-factor authentication."
      />

      {setupRequired ? (
        <div role="alert" className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
          <p>
            Your account type must use two-factor authentication. Turn it on below to continue; until then the rest of
            the site stays closed.
          </p>
        </div>
      ) : null}

      <AccountSection
        title="Two-factor authentication"
        description="Add an authenticator app as a second step at sign-in."
      >
        <TwoFactorSection enabled={user.two_factor_enabled} />
      </AccountSection>

      {!setupRequired ? (
        <>
          <AccountSection
            title="Password"
            description="Choose a new password. You will stay signed in on this device."
          >
            <PasswordForm />
          </AccountSection>

          <AccountSection
            title="Signed-in devices"
            description="See every device signed in to this account, revoke one, or sign out everywhere."
          >
            <Button variant="outline" asChild>
              <Link href="/account/devices">Manage devices</Link>
            </Button>
          </AccountSection>

          {recent ? (
            <AccountSection
              title="Recent activity"
              description="The latest sign-ins and security changes on this account."
            >
              <RecentActivity entries={recent.activities} total={recent.meta.total} />
            </AccountSection>
          ) : null}

          <AccountSection
            title="Danger zone"
            description="Permanently delete your account and revoke every session."
            danger
          >
            <DangerZone />
          </AccountSection>
        </>
      ) : null}
    </div>
  );
}
