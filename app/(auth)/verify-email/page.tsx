"use client";

import type { Route } from "next";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { RouteReady } from "@/components/transitions/route-ready";
import { useTransitionRouter } from "@/components/transitions/transition-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { firstAuthErrorMessage, postAuthApi } from "@/lib/auth/client";
import { safeNextFor } from "@/lib/auth/portals";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { syncStoredThemeToAccount } from "@/lib/theme/persist-theme";
import type { User } from "@/types/auth";

const RESEND_SECONDS = 60;

/**
 * Step two of signing in for an address that is not verified yet: the six
 * digit code from the email. The sealed challenge itself is in an httpOnly
 * cookie; this page only keeps the address to show.
 */
export default function VerifyEmailPage() {
  const router = useTransitionRouter();
  const [email] = useState<string | null>(() =>
    typeof window === "undefined" ? null : sessionStorage.getItem("verify_email"),
  );
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (!email) router.replace("/login");
  }, [email, router]);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  function expired() {
    sessionStorage.removeItem("verify_email");
    router.replace("/login");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      toast.error("Enter the 6-digit code.");
      return;
    }

    setBusy(true);
    const result = await postAuthApi<{ user: User } | { two_factor: true }>("/api/auth/verify-email", { code });
    setBusy(false);

    if (!result.ok) {
      toast.error(firstAuthErrorMessage(result.error), { duration: 4000 });
      if (result.error.status === 401) expired();
      return;
    }

    sessionStorage.removeItem("verify_email");

    // Verified. A second step follows when the account uses two-factor.
    if ("two_factor" in result.data) {
      router.push("/two-factor-challenge");
      return;
    }

    const next = safeNextFor(result.data.user, safeRedirectPath(sessionStorage.getItem("challenge_next"), "/")) as Route;
    sessionStorage.removeItem("challenge_next");

    await syncStoredThemeToAccount(result.data.user.theme);
    toast.success("Email verified");
    router.push(next);
    router.refresh();
  }

  async function resend() {
    const result = await postAuthApi<{ message: string }>("/api/auth/resend-verification", {});

    if (!result.ok) {
      toast.error(firstAuthErrorMessage(result.error), { duration: 4000 });
      if (result.error.status === 401) expired();
      return;
    }

    toast.success("A new code is on its way.");
    setWait(RESEND_SECONDS);
  }

  if (!email) return null;

  return (
    <Card>
      <RouteReady />
      <CardHeader>
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>
          We sent a 6-digit code to <strong className="font-medium text-foreground">{email}</strong>. It works for ten minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="otp-code" className="text-sm font-medium">
              Verification code
            </label>
            <Input
              id="otp-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-center text-lg tracking-[0.5em]"
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Verifying…" : "Verify and continue"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Did not get it?{" "}
          <button
            type="button"
            onClick={() => void resend()}
            disabled={wait > 0}
            className="font-medium text-foreground underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-60 disabled:no-underline"
          >
            {wait > 0 ? `Send a new code in ${wait}s` : "Send a new code"}
          </button>
        </p>
      </CardContent>
    </Card>
  );
}
