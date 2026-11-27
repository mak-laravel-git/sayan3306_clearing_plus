import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ActivationWizard } from "@/components/clubs/activation-wizard";
import { RouteReady } from "@/components/transitions/route-ready";
import { fetchActivationClub } from "@/lib/clubs/public";
import { normalizeClubCode } from "@/lib/clubs/types";

export const metadata: Metadata = {
  title: "Activate your club",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The page behind the link in a club's campaign email. The code in the URL
 * only says which club this is; activating needs a code sent to the club's
 * official inbox.
 */
export default async function ActivateClubPage({ params }: { params: Promise<{ code: string }> }) {
  const code = normalizeClubCode((await params).code);

  if (code === null) notFound();

  const club = await fetchActivationClub(code);

  if (club === null) notFound();

  return (
    <>
      <RouteReady />
      <ActivationWizard club={club} />
    </>
  );
}
