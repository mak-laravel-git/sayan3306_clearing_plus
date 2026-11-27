"use client";

import { MailPlus, MoreHorizontal, Plus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  changePersonRoleAction,
  handClubOverAction,
  invitePersonAction,
  reinstateClubAction,
  removePersonAction,
  reviewClubAction,
  saveClubAction,
  sendActivationEmailAction,
  suspendClubAction,
} from "@/app/(admin)/admin/clubs/actions";
import { ClubStatusBadge, EmailStatusBadge } from "@/components/admin/clubs/badges";
import { RouteReady } from "@/components/transitions/route-ready";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatMoney, type AdminClubDetail, type ClubMember } from "@/lib/clubs/types";

type Result = { ok: true; message: string } | { ok: false; message: string };
type Can = { manage: boolean; send: boolean; suspend: boolean };

const dateTime = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const when = (value: string | null) => (value ? dateTime.format(new Date(value)) : "—");

/**
 * One club for platform staff: its onboarding, its official email (fixed here
 * before it activates), its people, credits and the terms it accepted.
 */
export function ClubDetail({ club, can }: { club: AdminClubDetail; can: Can }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [suspend, setSuspend] = useState(false);
  const [invite, setInvite] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: "remove" | "owner"; member: ClubMember } | null>(null);

  function run(work: () => Promise<Result>, after?: () => void) {
    startTransition(async () => {
      const result = await work();

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message, { duration: 6000 });
      after?.();
      router.refresh();
    });
  }

  const waiting = club.status === "pre_registered";
  const admins = club.members.filter((member) => member.role === "club_admin" && member.status === "active").length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <RouteReady />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/admin/clubs" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            ← All clubs
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">{club.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {club.league} · {club.country}
            {club.continent ? ` · ${club.continent}` : ""} · <span className="font-mono">{club.code}</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ClubStatusBadge status={club.status} />
            {club.is_demo ? <Badge variant="outline">Demo club</Badge> : null}
            {club.founding_member ? <Badge variant="secondary">Founding Welfare Club</Badge> : null}
            {club.do_not_contact ? <Badge variant="destructive">Do not contact</Badge> : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {can.send && waiting ? (
            <Button variant="outline" disabled={pending} onClick={() => run(() => sendActivationEmailAction(club.code, club.activation_email_sent_at !== null))}>
              <MailPlus data-icon="inline-start" aria-hidden />
              {club.activation_email_sent_at ? "Send the email again" : "Send activation email"}
            </Button>
          ) : null}
          {can.manage && club.status === "active" && !club.activation_reviewed_at ? (
            <Button disabled={pending} onClick={() => run(() => reviewClubAction(club.code))}>
              <ShieldCheck data-icon="inline-start" aria-hidden />
              Mark activation as checked
            </Button>
          ) : null}
          {can.suspend && club.status !== "suspended" ? (
            <Button variant="destructive" disabled={pending} onClick={() => setSuspend(true)}>
              Suspend club
            </Button>
          ) : null}
          {can.suspend && club.status === "suspended" ? (
            <Button disabled={pending} onClick={() => run(() => reinstateClubAction(club.code))}>
              Reinstate club
            </Button>
          ) : null}
        </div>
      </header>

      {club.status === "suspended" ? (
        <p className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm">
          Suspended {when(club.suspended_at)}: {club.suspended_reason}. Nobody in this club can sign in.
        </p>
      ) : null}

      <section className="grid gap-4 rounded-2xl border border-border/70 bg-card/70 p-5 text-sm shadow-sm sm:grid-cols-2 lg:grid-cols-4" aria-label="Onboarding">
        <Fact label="Emailed" value={when(club.activation_email_sent_at)} />
        <Fact label="Opened the link" value={when(club.activation_link_opened_at)} />
        <Fact label="Activated" value={when(club.activated_at)} />
        <Fact label="Checked by the platform" value={when(club.activation_reviewed_at)} />
      </section>

      <ContactForm club={club} canManage={can.manage} pending={pending} run={run} />

      <section className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm" aria-labelledby="people">
        <div className="flex items-center justify-between gap-3">
          <h2 id="people" className="font-heading text-base font-semibold">
            People ({club.members.length})
          </h2>
          {can.manage && club.status === "active" ? (
            <Button size="sm" variant="outline" onClick={() => setInvite(true)}>
              <Plus data-icon="inline-start" aria-hidden />
              Add a person
            </Button>
          ) : null}
        </div>

        {club.members.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nobody yet. The first person is the owner who activates the club.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <tbody>
                {club.members.map((member) => (
                  <tr key={member.id} className="border-b last:border-0">
                    <td className="py-2.5 pr-3">
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </td>
                    <td className="py-2.5 pr-3">
                      {member.role_label}
                      {member.is_owner ? <Badge variant="outline" className="ml-2">Owner</Badge> : null}
                    </td>
                    <td className="py-2.5 pr-3">
                      <Badge variant={member.status === "invited" ? "secondary" : "outline"}>{member.status === "invited" ? "Invited" : "Active"}</Badge>
                    </td>
                    <td className="py-2.5 pr-3 text-muted-foreground">2FA {member.two_factor_enabled ? "on" : "off"}</td>
                    <td className="py-2.5 text-right">
                      {can.manage ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${member.name}`} disabled={pending}>
                              <MoreHorizontal aria-hidden />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!member.is_owner && member.role === "club_user" ? (
                              <DropdownMenuItem onSelect={() => run(() => changePersonRoleAction(club.code, member.id, "club_admin"))}>Make admin</DropdownMenuItem>
                            ) : null}
                            {!member.is_owner && member.role === "club_admin" && admins > 1 ? (
                              <DropdownMenuItem onSelect={() => run(() => changePersonRoleAction(club.code, member.id, "club_user"))}>Make user</DropdownMenuItem>
                            ) : null}
                            {!member.is_owner && member.role === "club_admin" && member.status === "active" ? (
                              <DropdownMenuItem onSelect={() => setConfirm({ kind: "owner", member })}>Make owner…</DropdownMenuItem>
                            ) : null}
                            {!member.is_owner ? <DropdownMenuSeparator /> : null}
                            {!member.is_owner ? (
                              <DropdownMenuItem variant="destructive" onSelect={() => setConfirm({ kind: "remove", member })}>
                                Remove from club…
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem disabled>The owner stays until the club is handed over</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm" aria-labelledby="credits">
          <h2 id="credits" className="font-heading text-base font-semibold">
            Founding Club credits
          </h2>
          {club.credits.length === 0 ? (
            <p className="text-sm text-muted-foreground">None. Credits are granted when a club activates by the deadline.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {club.credits.map((credit) => (
                <li key={credit.type}>
                  <div className="flex items-center justify-between gap-3">
                    <span>{credit.label}</span>
                    <span className="font-medium">{formatMoney(credit.amount_minor, credit.currency)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {credit.status}
                    {credit.expires_at ? ` · until ${when(credit.expires_at)}` : ""}
                    {credit.note ? ` · ${credit.note}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground">League licence fee: {formatMoney(club.league_fee_minor)}</p>
        </section>

        <section className="space-y-3 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm" aria-labelledby="terms">
          <h2 id="terms" className="font-heading text-base font-semibold">
            Club Terms
          </h2>
          {club.term_acceptances.length === 0 ? (
            <p className="text-sm text-muted-foreground">Not accepted yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {club.term_acceptances.map((acceptance) => (
                <li key={`${acceptance.version}-${acceptance.accepted_at}`}>
                  <span className="font-medium">Version {acceptance.version}</span>
                  <p className="text-xs text-muted-foreground">
                    {when(acceptance.accepted_at)} · {acceptance.by ?? "unknown"}
                    {acceptance.ip_address ? ` · ${acceptance.ip_address}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <SuspendDialog open={suspend} onClose={() => setSuspend(false)} pending={pending} onSubmit={(reason) => run(() => suspendClubAction(club.code, reason), () => setSuspend(false))} />
      <InviteDialog open={invite} onClose={() => setInvite(false)} pending={pending} onSubmit={(values) => run(() => invitePersonAction(club.code, values), () => setInvite(false))} />

      <Dialog open={confirm !== null} onOpenChange={(next) => !next && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirm?.kind === "owner" ? "Make this person the owner?" : "Remove from the club?"}</DialogTitle>
            <DialogDescription>
              {confirm?.kind === "owner"
                ? `${confirm.member.name} becomes the owner of ${club.name}. The current owner stays an admin.`
                : `${confirm?.member.name} loses access to ${club.name} at once, and every session of theirs ends.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(null)} disabled={pending}>
              Cancel
            </Button>
            <Button
              variant={confirm?.kind === "remove" ? "destructive" : "default"}
              disabled={pending}
              onClick={() =>
                confirm && run(() => (confirm.kind === "owner" ? handClubOverAction(club.code, confirm.member.id) : removePersonAction(club.code, confirm.member.id)), () => setConfirm(null))
              }
            >
              {confirm?.kind === "owner" ? "Make owner" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function ContactForm({ club, canManage, pending, run }: { club: AdminClubDetail; canManage: boolean; pending: boolean; run: (work: () => Promise<Result>) => void }) {
  const [values, setValues] = useState({
    official_email: club.official_email ?? "",
    contact_name: club.contact_name ?? "",
    key_contact_role: club.key_contact_role ?? "",
    phone: club.phone ?? "",
    website: club.website ?? "",
    do_not_contact: club.do_not_contact,
  });
  const waiting = club.status === "pre_registered";
  const set = (key: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement>) => setValues((current) => ({ ...current, [key]: event.target.value }));
  const clean = (value: string) => (value.trim() === "" ? null : value.trim());

  return (
    <form
      className="space-y-5 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        run(() =>
          saveClubAction(club.code, {
            ...(waiting ? { official_email: clean(values.official_email) } : {}),
            contact_name: clean(values.contact_name),
            key_contact_role: clean(values.key_contact_role),
            phone: clean(values.phone),
            website: clean(values.website),
            do_not_contact: values.do_not_contact,
          }),
        );
      }}
    >
      <div>
        <h2 className="font-heading text-base font-semibold">Official email and contact</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The activation code goes to the official email only. {waiting ? "Fix a missing or shared address here before sending." : "It can no longer be changed once the club has activated."}
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="club-email" className="text-sm font-medium">Official email</label>
        <Input id="club-email" type="email" value={values.official_email} onChange={set("official_email")} disabled={!canManage || !waiting} placeholder="info@club.com" />
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <EmailStatusBadge status={club.email_status} />
          {club.email_note ? <span>{club.email_note}</span> : null}
          {club.allowed_email_domains.length > 0 ? <span>Staff domain: {club.allowed_email_domains.map((domain) => `@${domain}`).join(", ")}</span> : <span>No staff domain</span>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Labeled id="c-name" label="Contact name">
          <Input id="c-name" value={values.contact_name} onChange={set("contact_name")} disabled={!canManage} />
        </Labeled>
        <Labeled id="c-role" label="Role at the club">
          <Input id="c-role" value={values.key_contact_role} onChange={set("key_contact_role")} disabled={!canManage} />
        </Labeled>
        <Labeled id="c-phone" label="Phone">
          <Input id="c-phone" value={values.phone} onChange={set("phone")} disabled={!canManage} />
        </Labeled>
        <Labeled id="c-site" label="Website">
          <Input id="c-site" type="url" value={values.website} onChange={set("website")} disabled={!canManage} placeholder="https://" />
        </Labeled>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-foreground"
          checked={values.do_not_contact}
          disabled={!canManage}
          onChange={(event) => setValues((current) => ({ ...current, do_not_contact: event.target.checked }))}
        />
        Do not contact this club (leaves it out of every batch email)
      </label>

      {canManage ? (
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      ) : null}
    </form>
  );
}

function Labeled({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

function SuspendDialog({ open, onClose, pending, onSubmit }: { open: boolean; onClose: () => void; pending: boolean; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspend this club?</DialogTitle>
          <DialogDescription>Everyone in the club is signed out at once and cannot sign in until the club is reinstated. The reason is kept in the audit log.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label htmlFor="suspend-reason" className="text-sm font-medium">Reason</label>
          <Input id="suspend-reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={255} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={pending || reason.trim() === ""} onClick={() => onSubmit(reason)}>
            Suspend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InviteDialog({ open, onClose, pending, onSubmit }: { open: boolean; onClose: () => void; pending: boolean; onSubmit: (values: { name: string; email: string; role: string }) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("club_user");

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a person to the club</DialogTitle>
          <DialogDescription>As platform staff you can add anyone, whatever their email domain. They get an email with a code to activate their account.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({ name, email, role });
          }}
        >
          <Labeled id="add-name" label="Name">
            <Input id="add-name" value={name} onChange={(event) => setName(event.target.value)} required />
          </Labeled>
          <Labeled id="add-email" label="Email">
            <Input id="add-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </Labeled>
          <Labeled id="add-role" label="Role">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="add-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="club_admin">Club admin</SelectItem>
                <SelectItem value="club_user">Club user</SelectItem>
              </SelectContent>
            </Select>
          </Labeled>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !name || !email}>
              {pending ? "Sending…" : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
