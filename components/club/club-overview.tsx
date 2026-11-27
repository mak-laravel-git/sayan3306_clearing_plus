import { Award, CalendarClock, Gift, Landmark } from "lucide-react";

import { TermsBanner } from "@/components/club/terms-banner";
import { Badge } from "@/components/ui/badge";
import { formatMoney, type ClubCredit, type OwnClub } from "@/lib/clubs/types";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

function day(value: string | null): string | null {
  return value ? dateFormat.format(new Date(value)) : null;
}

/** The Founding Welfare Club badge: shown on the dashboard of every club that has activated. */
export function FoundingBadge() {
  return (
    <Badge className="gap-1.5 bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:text-amber-300">
      <Award className="size-3.5" aria-hidden />
      Founding Welfare Club
    </Badge>
  );
}

/**
 * What a club sees first: who it is, whether it is a Founding Welfare Club,
 * the Club Terms it has to keep accepted, and the credits it was granted.
 * The credits are for the admins (they carry money terms).
 */
export function ClubOverview({
  club,
  canAcceptTerms,
}: {
  club: OwnClub;
  canAcceptTerms: boolean;
}) {
  const admin = club.membership?.role === "club_admin";

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              {club.league} · {club.country}
            </p>
            <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight">{club.name}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* The offer is for every club that activated; the badge shows on its dashboard and profile. */}
            <FoundingBadge />
            {club.membership?.is_owner ? <Badge variant="outline">Owner</Badge> : null}
          </div>
        </div>

        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarClock className="size-4" aria-hidden /> Active since
            </dt>
            <dd className="mt-1 font-medium">{day(club.activated_at) ?? "—"}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <Landmark className="size-4" aria-hidden /> Club Terms
            </dt>
            <dd className="mt-1 font-medium">
              {club.terms.accepted_version ? `Version ${club.terms.accepted_version}` : "Not accepted yet"}
              {club.terms.accepted_at ? <span className="block text-xs font-normal text-muted-foreground">accepted {day(club.terms.accepted_at)}</span> : null}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Club ID</dt>
            <dd className="mt-1 font-mono text-xs">{club.code}</dd>
          </div>
        </dl>
      </section>

      {club.terms.needs_acceptance ? <TermsBanner version={club.terms.current_version} canAccept={canAcceptTerms} /> : null}

      {admin && club.credits.length > 0 ? (
        <section aria-labelledby="club-credits" className="space-y-3">
          <h2 id="club-credits" className="flex items-center gap-2 font-heading text-base font-semibold">
            <Gift className="size-4 text-muted-foreground" aria-hidden /> Founding Club credits
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {club.credits.map((credit) => (
              <CreditCard key={credit.type} credit={credit} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function CreditCard({ credit }: { credit: ClubCredit }) {
  const expires = day(credit.expires_at);

  return (
    <article className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{credit.label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{formatMoney(credit.amount_minor, credit.currency)}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        {credit.type === "founding_licence"
          ? credit.amount_minor === null
            ? "The licence fee of your league is still being agreed; the credit will match it."
            : "Covers your first-year licence."
          : "Covers one approved Claim, applied to your first monthly Claim invoice."}
        {expires ? ` Valid until ${expires}.` : credit.type === "founding_claim" ? " The end date is set when the platform launches." : ""}
      </p>
    </article>
  );
}
