import type { Metadata } from "next";

import { ClubFinder } from "@/components/clubs/club-finder";
import { RouteReady } from "@/components/transitions/route-ready";
import { fetchContinents } from "@/lib/clubs/public";

export const metadata: Metadata = {
  title: "Activate your club",
  robots: { index: false, follow: false },
};

/** Where a pre-registered club finds itself and starts activating. */
export default async function ClubRegisterPage() {
  const continents = await fetchContinents();

  return (
    <>
      <RouteReady />
      <ClubFinder continents={continents} />
    </>
  );
}
