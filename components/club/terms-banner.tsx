"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { acceptTermsAction } from "@/app/(club)/club/profile/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/** A newer version of the Club Terms is out. An admin accepts it for the club; everyone else waits for them. */
export function TermsBanner({ version, canAccept }: { version: string | null; canAccept: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [read, setRead] = useState(false);

  if (version === null) return null;

  return (
    <Alert>
      <AlertTitle>New Club Terms ({version})</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>The Club Terms changed. Your club has to accept the new version to keep using the platform.</p>
        {canAccept ? (
          <div className="space-y-3">
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-0.5 size-4 accent-foreground" checked={read} onChange={(event) => setRead(event.target.checked)} />
              <span>I have read version {version} and accept it on behalf of the club.</span>
            </label>
            <Button
              size="sm"
              disabled={!read || pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await acceptTermsAction(version);
                  if (!result.ok) {
                    toast.error(result.message);
                    return;
                  }
                  toast.success(result.message);
                  router.refresh();
                })
              }
            >
              {pending ? "Saving…" : "Accept the new terms"}
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground">Ask a club admin to accept them.</p>
        )}
      </AlertDescription>
    </Alert>
  );
}
