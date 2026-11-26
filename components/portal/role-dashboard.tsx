import { CheckCircle2, Circle, KeyRound, MailCheck, ShieldCheck, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { RouteReady } from "@/components/transitions/route-ready";
import type { User } from "@/types/auth";

export type DashboardSection = {
  title: string;
  description: string;
  icon: LucideIcon;
  /** What belongs here once the feature exists. Shown as a plain list, not as links. */
  items: string[];
};

/**
 * The shared layout of a role's first page: who you are and what protects the
 * account, then the areas this role will work in. The areas are placeholders
 * until their features are built, so nothing here promises data that is not
 * there.
 */
export function RoleDashboard({
  user,
  eyebrow,
  title,
  intro,
  sections,
  aside,
}: {
  user: User;
  eyebrow: string;
  title: string;
  intro: string;
  sections: DashboardSection[];
  aside?: ReactNode;
}) {
  const verified = Boolean(user.email_verified_at);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <RouteReady />

      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">{eyebrow}</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{intro}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatusTile icon={ShieldCheck} label="Signed in as" value={user.name} hint={user.email} />
        <StatusTile
          icon={MailCheck}
          label="Email"
          value={verified ? "Verified" : "Not verified"}
          hint={verified ? "Confirmed with a code" : "Verify it from your account"}
          good={verified}
        />
        <StatusTile
          icon={KeyRound}
          label="Two-factor"
          value={user.two_factor_enabled ? "On" : "Off"}
          hint={user.two_factor_enabled ? "Your account has a second step" : "Turn it on from Security"}
          good={user.two_factor_enabled}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <section.icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="font-heading text-base font-semibold">{section.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {section.items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-muted-foreground">
                  <Circle className="size-3.5 shrink-0" aria-hidden />
                  {item}
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[11px]">Coming soon</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {aside}
    </div>
  );
}

function StatusTile({
  icon: Icon,
  label,
  value,
  hint,
  good,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  good?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        {good ? <CheckCircle2 className="size-4 text-emerald-500" aria-hidden /> : <Icon className="size-4" aria-hidden />}
      </div>
      <p className="mt-3 truncate text-xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
    </article>
  );
}
