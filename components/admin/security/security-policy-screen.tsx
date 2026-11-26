"use client";

import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { saveSecurityPolicyAction } from "@/app/(admin)/admin/application/security/actions";
import { RouteReady } from "@/components/transitions/route-ready";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { RolePolicy, SecurityPolicy } from "@/lib/admin/security-policy";

type Draft = Record<string, RolePolicy>;

function toDraft(policy: SecurityPolicy): Draft {
  return Object.fromEntries(
    policy.roles.map((row) => [
      row.role,
      {
        require_email_verification: row.require_email_verification,
        require_two_factor: row.require_two_factor,
        idle_minutes: row.idle_minutes,
      },
    ]),
  );
}

function humanIdle(minutes: number): string {
  if (minutes % 1440 === 0) return `${minutes / 1440} day${minutes === 1440 ? "" : "s"}`;
  if (minutes % 60 === 0) return `${minutes / 60} hour${minutes === 60 ? "" : "s"}`;
  return `${minutes} minutes`;
}

/**
 * Application settings > Security policy. One row per role: must the email be
 * confirmed with a code, must the account use two-factor, and after how many
 * idle minutes a session ends. The rules are shared by both sites.
 */
export function SecurityPolicyScreen({ initial }: { initial: SecurityPolicy }) {
  const [policy, setPolicy] = useState(initial);
  const [draft, setDraft] = useState<Draft>(() => toDraft(initial));
  const [pending, startTransition] = useTransition();

  const original = toDraft(policy);
  const dirty = JSON.stringify(draft) !== JSON.stringify(original);
  const { min_idle_minutes: min, max_idle_minutes: max } = policy.limits;

  function change(role: string, patch: Partial<RolePolicy>) {
    setDraft((current) => ({ ...current, [role]: { ...current[role], ...patch } }));
  }

  function save() {
    const changed: Record<string, Partial<RolePolicy>> = {};
    for (const [role, values] of Object.entries(draft)) {
      if (JSON.stringify(values) !== JSON.stringify(original[role])) changed[role] = values;
    }

    startTransition(async () => {
      const result = await saveSecurityPolicyAction(changed);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setPolicy(result.policy);
      setDraft(toDraft(result.policy));
      toast.success(result.message);
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <RouteReady />
      <header>
        <p className="text-sm text-muted-foreground">Application settings</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Security policy</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Sign-in rules for each kind of account, the same on Clearing+ and Job+. A rule changes what the person has to
          do the next time the API sees them.
        </p>
      </header>

      {!policy.mail_ready ? (
        <div role="alert" className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
          <p>
            No mail server is set up, so a verification code cannot be emailed. New people could not finish signing up.
            Set up <strong>SMTP</strong> first, or turn email verification off for the role.
          </p>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card/70 shadow-sm">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Verify email with a code</th>
              <th className="px-4 py-3 font-medium">Require two-factor</th>
              <th className="px-4 py-3 font-medium">Sign out after idle (minutes)</th>
            </tr>
          </thead>
          <tbody>
            {policy.roles.map((row) => {
              const value = draft[row.role];

              return (
                <tr key={row.role} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-medium">
                      <ShieldCheck className="size-4 text-muted-foreground" aria-hidden />
                      {row.label}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={value.require_email_verification}
                      onCheckedChange={(checked) => change(row.role, { require_email_verification: checked })}
                      aria-label={`Verify email for ${row.label}`}
                      disabled={pending}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={value.require_two_factor}
                      onCheckedChange={(checked) => change(row.role, { require_two_factor: checked })}
                      aria-label={`Require two-factor for ${row.label}`}
                      disabled={pending}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={min}
                        max={max}
                        value={value.idle_minutes}
                        onChange={(event) => change(row.role, { idle_minutes: Number(event.target.value) || min })}
                        className="w-28"
                        aria-label={`Idle minutes for ${row.label}`}
                        disabled={pending}
                      />
                      <span className="text-xs text-muted-foreground">
                        {humanIdle(value.idle_minutes)}
                        {value.idle_minutes !== row.defaults.idle_minutes ? ` (default ${humanIdle(row.defaults.idle_minutes)})` : ""}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Defaults: the email code is required for everyone, two-factor is optional, platform admins and placement managers
        sign out after 30 idle minutes and everyone else after 7 days. Idle time must be between {min} minutes and{" "}
        {humanIdle(max)}.
      </p>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={!dirty || pending}>
          {pending ? "Saving…" : "Save policy"}
        </Button>
        {dirty ? (
          <Button variant="ghost" onClick={() => setDraft(toDraft(policy))} disabled={pending}>
            Discard changes
          </Button>
        ) : null}
      </div>
    </div>
  );
}
