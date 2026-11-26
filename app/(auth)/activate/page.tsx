"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

import PasswordInput from "@/components/forms/password-input";
import { RouteReady } from "@/components/transitions/route-ready";
import { useTransitionRouter } from "@/components/transitions/transition-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { firstAuthErrorMessage, postAuthApi } from "@/lib/auth/client";

/**
 * An administrator created this account. The person enters the code from the
 * invitation email and chooses their own password; then they sign in as usual.
 */
function ActivateForm() {
  const router = useTransitionRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (password !== confirmation) {
      toast.error("Passwords do not match.");
      return;
    }

    setBusy(true);
    const result = await postAuthApi<{ message: string }>("/api/auth/activate", {
      email,
      code,
      password,
      password_confirmation: confirmation,
    });
    setBusy(false);

    if (!result.ok) {
      toast.error(firstAuthErrorMessage(result.error), { duration: 4000 });
      return;
    }

    toast.success("Account activated. Sign in with your new password.");
    router.push("/login");
  }

  return (
    <Card>
      <RouteReady />
      <CardHeader>
        <CardTitle className="text-2xl">Activate your account</CardTitle>
        <CardDescription>
          Enter the code from your invitation email and choose a password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="activate-email" className="text-sm font-medium">Email</label>
            <Input id="activate-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <label htmlFor="activate-code" className="text-sm font-medium">Code from the email</label>
            <Input
              id="activate-code"
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
            <label htmlFor="activate-password" className="text-sm font-medium">New password</label>
            <PasswordInput id="activate-password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <label htmlFor="activate-confirm" className="text-sm font-medium">Confirm password</label>
            <PasswordInput id="activate-confirm" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Activating…" : "Activate account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">Loading…</CardContent>
        </Card>
      }
    >
      <ActivateForm />
    </Suspense>
  );
}
