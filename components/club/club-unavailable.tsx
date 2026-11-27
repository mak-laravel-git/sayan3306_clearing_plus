import { ShieldAlert } from "lucide-react";

import { RouteReady } from "@/components/transitions/route-ready";
import type { ClubSummary } from "@/types/auth";

/** Shown instead of the club area when the person's club cannot be used: not active, suspended, or no membership. */
export function ClubUnavailable({ club }: { club: ClubSummary | null | undefined }) {
  const suspended = club?.status === "suspended";

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 py-16 text-center">
      <RouteReady />
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <ShieldAlert className="size-6" aria-hidden />
      </span>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        {club ? (suspended ? `${club.name} is suspended` : `${club.name} is not active`) : "Your account is not linked to a club"}
      </h1>
      <p className="text-sm text-muted-foreground">
        {club
          ? "Nobody can use the club area while this is so. Please contact the Clearing+ team."
          : "Ask your club admin to invite you again, or contact the Clearing+ team."}
      </p>
    </div>
  );
}
