"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { saveClubProfileAction } from "@/app/(club)/club/profile/actions";
import { RouteReady } from "@/components/transitions/route-ready";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OwnClub } from "@/lib/clubs/types";

/** The club's contact details. Admins edit them; the name, league and email of the club are the platform's to change. */
export function ProfileForm({ club, canEdit }: { club: OwnClub; canEdit: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState({
    contact_name: club.contact_name ?? "",
    key_contact_role: club.key_contact_role ?? "",
    phone: club.phone ?? "",
    website: club.website ?? "",
  });

  const set = (key: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement>) => setValues((current) => ({ ...current, [key]: event.target.value }));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <RouteReady />

      <header>
        <p className="text-sm text-muted-foreground">Club</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Contact details</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {canEdit ? "How the Clearing+ team reaches your club." : "Your club admin keeps these up to date."}
        </p>
      </header>

      <section className="grid gap-4 rounded-2xl border border-border/70 bg-card/70 p-5 text-sm shadow-sm sm:grid-cols-3">
        <ReadOnly label="Club" value={club.name} />
        <ReadOnly label="League" value={`${club.league} · ${club.country}`} />
        <ReadOnly label="Official email" value={club.official_email ?? "—"} />
      </section>

      <form
        className="space-y-5 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            const result = await saveClubProfileAction(values);

            if (!result.ok) {
              toast.error(result.message);
              return;
            }

            toast.success(result.message);
            router.refresh();
          });
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="contact-name" label="Contact name">
            <Input id="contact-name" value={values.contact_name} onChange={set("contact_name")} disabled={!canEdit} maxLength={160} />
          </Field>
          <Field id="contact-role" label="Role at the club">
            <Input id="contact-role" value={values.key_contact_role} onChange={set("key_contact_role")} disabled={!canEdit} maxLength={120} placeholder="Academy Director" />
          </Field>
          <Field id="contact-phone" label="Phone">
            <Input id="contact-phone" type="tel" value={values.phone} onChange={set("phone")} disabled={!canEdit} maxLength={48} />
          </Field>
          <Field id="contact-website" label="Website">
            <Input id="contact-website" type="url" value={values.website} onChange={set("website")} disabled={!canEdit} maxLength={255} placeholder="https://" />
          </Field>
        </div>

        {canEdit ? (
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save contact details"}
          </Button>
        ) : null}
      </form>
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-medium">{value}</p>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
