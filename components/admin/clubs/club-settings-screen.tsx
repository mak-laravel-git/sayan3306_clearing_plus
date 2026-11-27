"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { saveClubSettingsAction, saveLeagueFeeAction } from "@/app/(admin)/admin/clubs/actions";
import { RouteReady } from "@/components/transitions/route-ready";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { formatMoney, type ClubSettingsValues, type LeagueFee } from "@/lib/clubs/types";

/**
 * The club rules a super admin controls: the switch that lets activation
 * emails go out, the Founding Club deadline, the Claim credit, and the yearly
 * licence fee of every league (the Founding Club licence credit follows it).
 */
export function ClubSettingsScreen({ settings, leagues }: { settings: ClubSettingsValues; leagues: LeagueFee[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState({
    activation_emails_enabled: settings.activation_emails_enabled,
    founding_deadline: settings.founding_deadline.slice(0, 10),
    claim_credit_pounds: String(settings.claim_credit_minor / 100),
    claim_credit_valid_days: String(settings.claim_credit_valid_days),
    official_launch_date: settings.official_launch_date ?? "",
  });
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [fees, setFees] = useState<Record<number, string>>(() => Object.fromEntries(leagues.map((league) => [league.id, league.licence_fee_minor === null ? "" : String(league.licence_fee_minor / 100)])));

  function save(event: React.FormEvent) {
    event.preventDefault();

    startTransition(async () => {
      const result = await saveClubSettingsAction({
        activation_emails_enabled: values.activation_emails_enabled,
        founding_deadline: values.founding_deadline,
        claim_credit_minor: Math.round(Number(values.claim_credit_pounds) * 100),
        claim_credit_valid_days: Number(values.claim_credit_valid_days),
        official_launch_date: values.official_launch_date === "" ? null : values.official_launch_date,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  function saveFee(league: LeagueFee) {
    startTransition(async () => {
      const result = await saveLeagueFeeAction(league.id, fees[league.id] ?? "");

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    });
  }

  const shown = leagues.filter((league) => !onlyMissing || league.licence_fee_minor === null);
  const missing = leagues.filter((league) => league.licence_fee_minor === null).length;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <RouteReady />

      <header>
        <p className="text-sm text-muted-foreground">Clubs</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Club settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">The offer to Founding Clubs and the switch for activation emails. Changes are in the audit log.</p>
      </header>

      <form onSubmit={save} className="space-y-6 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <label htmlFor="emails-on" className="text-sm font-medium">
              Send activation emails
            </label>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Off until the mail server is set up (Application settings, SMTP). While it is off, no club is emailed, whatever is selected on the Clubs screen.
            </p>
          </div>
          <Switch id="emails-on" checked={values.activation_emails_enabled} onCheckedChange={(on) => setValues((current) => ({ ...current, activation_emails_enabled: on }))} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Labeled id="deadline" label="Founding Club deadline" hint="A club that activates by the end of this day gets the credits.">
            <Input id="deadline" type="date" value={values.founding_deadline} onChange={(event) => setValues((current) => ({ ...current, founding_deadline: event.target.value }))} required />
          </Labeled>
          <Labeled id="launch" label="Official launch date" hint="The Claim credit runs out some days after it. Leave empty until it is known.">
            <Input id="launch" type="date" value={values.official_launch_date} onChange={(event) => setValues((current) => ({ ...current, official_launch_date: event.target.value }))} />
          </Labeled>
          <Labeled id="claim" label="Claim credit (£)" hint="One approved Claim, applied to the first monthly invoice.">
            <Input id="claim" type="number" min="0" step="1" value={values.claim_credit_pounds} onChange={(event) => setValues((current) => ({ ...current, claim_credit_pounds: event.target.value }))} required />
          </Labeled>
          <Labeled id="days" label="Claim credit valid for (days after launch)" hint="">
            <Input id="days" type="number" min="1" step="1" value={values.claim_credit_valid_days} onChange={(event) => setValues((current) => ({ ...current, claim_credit_valid_days: event.target.value }))} required />
          </Labeled>
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </form>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm" aria-labelledby="fees">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="fees" className="font-heading text-base font-semibold">
              Yearly licence fee by league
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              The Founding Club licence credit equals the fee of the club&apos;s league on the day it activates. A league without a fee gives a credit without an amount until one is set.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4 accent-foreground" checked={onlyMissing} onChange={(event) => setOnlyMissing(event.target.checked)} />
            Only leagues without a fee <Badge variant="secondary">{missing}</Badge>
          </label>
        </div>

        <div className="max-h-[32rem] overflow-y-auto rounded-xl border border-border/70">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b">
                <th className="px-3 py-2 font-medium">League</th>
                <th className="px-3 py-2 font-medium">Clubs</th>
                <th className="px-3 py-2 font-medium">Fee (£)</th>
                <th className="w-20 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {shown.map((league) => {
                const edited = (fees[league.id] ?? "") !== (league.licence_fee_minor === null ? "" : String(league.licence_fee_minor / 100));

                return (
                  <tr key={league.id} className="border-b last:border-0">
                    <td className="px-3 py-2">
                      <div className="font-medium">{league.name}</div>
                      <div className="text-xs text-muted-foreground">{league.country} · tier {league.tier}</div>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{league.clubs}</td>
                    <td className="px-3 py-2">
                      <Input
                        aria-label={`Licence fee of ${league.name}, ${league.country}`}
                        type="number"
                        min="0"
                        step="1"
                        className="w-32"
                        value={fees[league.id] ?? ""}
                        placeholder={formatMoney(null)}
                        onChange={(event) => setFees((current) => ({ ...current, [league.id]: event.target.value }))}
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="outline" disabled={pending || !edited} onClick={() => saveFee(league)}>
                        Save
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Labeled({ id, label, hint, children }: { id: string; label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
