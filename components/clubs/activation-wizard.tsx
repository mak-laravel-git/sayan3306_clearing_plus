"use client";

import { CheckCircle2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import PasswordInput from "@/components/forms/password-input";
import { useTransitionRouter } from "@/components/transitions/transition-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { firstAuthErrorMessage, postAuthApi } from "@/lib/auth/client";
import type { ActivationClub } from "@/lib/clubs/types";
import type { User } from "@/types/auth";

type Step = "confirm" | "code" | "done";

const BLOCKED: Record<NonNullable<ActivationClub["blocked_reason"]>, { title: string; text: string }> = {
  already_active: {
    title: "This club is already active",
    text: "Someone at the club has already activated it. Sign in, or ask your club admin to invite you.",
  },
  suspended: {
    title: "This club cannot be activated right now",
    text: "Please contact the Clearing+ team.",
  },
  needs_email: {
    title: "We need an email address for this club",
    text: "We do not have a confirmed official email address for this club yet. Please contact the Clearing+ team and we will add it.",
  },
};

/**
 * Three steps: see the club, ask for a code at its official inbox, then enter
 * the code, choose a password and accept the Club Terms. Everything that
 * proves who the person is happens on the server.
 */
export function ActivationWizard({ club }: { club: ActivationClub }) {
  const router = useTransitionRouter();
  const [step, setStep] = useState<Step>("confirm");
  const [masked, setMasked] = useState(club.masked_email);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    setBusy(true);
    const result = await postAuthApi<{ masked_email: string }>(`/api/clubs/activation/${club.code}/send-code`, {});
    setBusy(false);

    if (!result.ok) {
      toast.error(firstAuthErrorMessage(result.error), { duration: 5000 });
      return;
    }

    setMasked(result.data.masked_email);
    setStep("code");
    toast.success("We sent you a code.");
  }

  async function activate(event: React.FormEvent) {
    event.preventDefault();

    if (password !== confirmation) {
      toast.error("Passwords do not match.");
      return;
    }

    setBusy(true);
    const result = await postAuthApi<{ activated: true; user: User }>(`/api/clubs/activation/${club.code}/activate`, {
      code,
      password,
      password_confirmation: confirmation,
      accept_terms: accepted,
      terms_version: club.terms.version,
    });
    setBusy(false);

    if (!result.ok) {
      toast.error(firstAuthErrorMessage(result.error), { duration: 5000 });
      return;
    }

    setStep("done");
    toast.success("Your club is active.");

    // Two-factor is the next thing a club has to set up; then the club dashboard.
    const next = result.data.user.requirements?.two_factor_setup_needed ? "/account/security?setup=required" : "/club";
    router.push(next as never);
    router.refresh();
  }

  if (club.blocked_reason) {
    const blocked = BLOCKED[club.blocked_reason];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{club.name}</CardTitle>
          <CardDescription>
            {club.league} · {club.country}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTitle>{blocked.title}</AlertTitle>
            <AlertDescription>{blocked.text}</AlertDescription>
          </Alert>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === "done") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <CheckCircle2 className="size-10 text-emerald-500" aria-hidden />
          <p className="text-xl font-semibold">{club.name} is active</p>
          <p className="text-sm text-muted-foreground">Taking you to your club dashboard…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Badge variant="secondary" className="w-fit">
          Step {step === "confirm" ? 1 : 2} of 2
        </Badge>
        <CardTitle className="text-2xl">{club.name}</CardTitle>
        <CardDescription>
          {club.league} · {club.country}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "confirm" ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/40 p-4 text-sm">
              <MailCheck className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
              <p>
                To make sure you are the club, we send a code to its official email address{" "}
                <span className="font-medium">{masked}</span>. Only someone who can read that inbox can activate the club.
              </p>
            </div>
            <Button className="w-full" onClick={sendCode} disabled={busy}>
              {busy ? "Sending…" : "Send me the code"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Not your club? <Link href="/register/club" className="underline underline-offset-4">Find your club</Link>
            </p>
          </div>
        ) : (
          <form onSubmit={activate} className="space-y-5">
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code to <span className="font-medium text-foreground">{masked}</span>. It works for 10 minutes.
            </p>

            <div className="space-y-2">
              <label htmlFor="club-code" className="text-sm font-medium">Code from the email</label>
              <Input
                id="club-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-lg tracking-[0.5em]"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="club-password" className="text-sm font-medium">Choose a password</label>
              <PasswordInput id="club-password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>

            <div className="space-y-2">
              <label htmlFor="club-password-confirm" className="text-sm font-medium">Confirm password</label>
              <PasswordInput id="club-password-confirm" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
            </div>

            <section className="space-y-2" aria-labelledby="club-terms-title">
              <h2 id="club-terms-title" className="text-sm font-medium">
                {club.terms.title} <span className="text-muted-foreground">(version {club.terms.version})</span>
              </h2>
              {club.terms.is_draft ? (
                <Alert>
                  <AlertDescription>This is a draft of the Club Terms. The final text replaces it before launch.</AlertDescription>
                </Alert>
              ) : null}
              <div className="max-h-48 overflow-y-auto rounded-xl border border-border/70 bg-background/60 p-3 text-sm whitespace-pre-line" tabIndex={0}>
                {club.terms.body}
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-foreground"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                />
                <span>I accept the Club Terms, including the anti-circumvention clause, on behalf of {club.name}.</span>
              </label>
            </section>

            <Button type="submit" className="w-full" disabled={busy || code.length !== 6 || !accepted}>
              {busy ? "Activating…" : "Activate my club"}
            </Button>

            <button type="button" onClick={sendCode} disabled={busy} className="mx-auto block text-xs text-muted-foreground underline underline-offset-4 disabled:opacity-50">
              Send the code again
            </button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
