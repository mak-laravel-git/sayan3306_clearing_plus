import { ShieldAlert } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/dal";
import { homeFor } from "@/lib/auth/portals";

/** Shown with a 403 when a signed-in person opens a dashboard that is not theirs. */
export default async function Forbidden() {
  const user = await getCurrentUser().catch(() => null);
  const home = user ? homeFor(user) : "/login";

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="size-7" aria-hidden />
      </span>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold">You don&apos;t have access to this page</h1>
        <p className="text-sm text-muted-foreground">
          This page belongs to another kind of account. Nothing was changed.
        </p>
      </div>
      <Button asChild>
        <Link href={home}>{user ? "Go to my dashboard" : "Sign in"}</Link>
      </Button>
    </main>
  );
}
