"use client";

import { MoreHorizontal, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  changeMemberRoleAction,
  inviteMemberAction,
  removeMemberAction,
  resendInvitationAction,
  transferOwnershipAction,
} from "@/app/(club)/club/team/actions";
import { RouteReady } from "@/components/transitions/route-ready";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClubMember } from "@/lib/clubs/types";

type Role = "club_admin" | "club_user";
type Result = { ok: true; message: string } | { ok: false; message: string };

const ROLE_LABEL: Record<Role, string> = { club_admin: "Club admin", club_user: "Club user" };

/**
 * The people of the club. What each action offers follows the club's rules (the
 * API enforces them): any admin invites, promotes a user and removes a user;
 * only the owner takes admin rights away, removes an admin or hands the club over.
 */
export function TeamScreen({
  members,
  canManage,
  me,
  officialDomains,
}: {
  members: ClubMember[];
  canManage: boolean;
  me: { email: string; isOwner: boolean };
  officialDomains: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [invite, setInvite] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: "remove" | "owner"; member: ClubMember } | null>(null);

  function run(work: () => Promise<Result>, after?: () => void) {
    startTransition(async () => {
      const result = await work();

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      after?.();
      router.refresh();
    });
  }

  const admins = members.filter((member) => member.role === "club_admin" && member.status === "active").length;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <RouteReady />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Club</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Team</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {canManage
              ? "Invite the people of your club. They get an email with a code, confirm their address and choose their own password."
              : "The people of your club. Your club admin manages who is here."}
          </p>
        </div>
        {canManage ? (
          <Button onClick={() => setInvite(true)}>
            <Plus data-icon="inline-start" aria-hidden />
            Invite someone
          </Button>
        ) : null}
      </header>

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card/70 shadow-sm">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Person</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Two-factor</th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const mine = member.email === me.email;
              const target = member.role === "club_admin";
              // What this person (me) may do to this row; the API makes the final decision.
              const canRole = canManage && !mine && !member.is_owner && (target ? me.isOwner : true);
              const canRemove = canManage && !mine && !member.is_owner && (target ? me.isOwner : true) && !(target && admins <= 1);
              const canHandOver = me.isOwner && !mine && member.status === "active" && target;

              return (
                <tr key={member.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {member.name} {mine ? <span className="text-xs font-normal text-muted-foreground">(you)</span> : null}
                    </div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {member.role_label}
                    {member.is_owner ? <Badge variant="outline" className="ml-2">Owner</Badge> : null}
                  </td>
                  <td className="px-4 py-3">
                    {member.status === "invited" ? <Badge variant="secondary">Invited</Badge> : <Badge variant="outline">Active</Badge>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{member.two_factor_enabled ? "On" : "Off"}</td>
                  <td className="px-4 py-3 text-right">
                    {canManage && (canRole || canRemove || canHandOver || member.status === "invited") ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${member.name}`} disabled={pending}>
                            <MoreHorizontal aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canRole && member.role === "club_user" ? (
                            <DropdownMenuItem onSelect={() => run(() => changeMemberRoleAction(member.id, "club_admin"))}>Make admin</DropdownMenuItem>
                          ) : null}
                          {canRole && member.role === "club_admin" ? (
                            <DropdownMenuItem onSelect={() => run(() => changeMemberRoleAction(member.id, "club_user"))}>Make user</DropdownMenuItem>
                          ) : null}
                          {member.status === "invited" ? (
                            <DropdownMenuItem onSelect={() => run(() => resendInvitationAction(member.id))}>Send invitation again</DropdownMenuItem>
                          ) : null}
                          {canHandOver ? <DropdownMenuItem onSelect={() => setConfirm({ kind: "owner", member })}>Hand the club over…</DropdownMenuItem> : null}
                          {canRemove ? <DropdownMenuSeparator /> : null}
                          {canRemove ? (
                            <DropdownMenuItem variant="destructive" onSelect={() => setConfirm({ kind: "remove", member })}>
                              Remove from club…
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <InviteDialog
        open={invite}
        onClose={() => setInvite(false)}
        pending={pending}
        domains={officialDomains}
        onSubmit={(values) => run(() => inviteMemberAction(values), () => setInvite(false))}
      />

      <Dialog open={confirm !== null} onOpenChange={(next) => !next && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirm?.kind === "owner" ? "Hand the club over?" : "Remove from the club?"}</DialogTitle>
            <DialogDescription>
              {confirm?.kind === "owner"
                ? `${confirm.member.name} becomes the owner of the club. You stay an admin but can no longer remove admins or hand the club over.`
                : `${confirm?.member.name} loses access to the club at once, and every session of theirs ends.`}
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
                confirm && run(() => (confirm.kind === "owner" ? transferOwnershipAction(confirm.member.id) : removeMemberAction(confirm.member.id)), () => setConfirm(null))
              }
            >
              {confirm?.kind === "owner" ? "Hand over" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InviteDialog({
  open,
  onClose,
  pending,
  domains,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  pending: boolean;
  domains: string[];
  onSubmit: (values: { name: string; email: string; role: string }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("club_user");

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite someone</DialogTitle>
          <DialogDescription>
            {domains.length > 0
              ? `Use a club email address (${domains.map((domain) => `@${domain}`).join(", ")}).`
              : "Your club has no official email domain, so the Clearing+ team has to add new people. Contact them."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({ name, email, role });
          }}
        >
          <div className="space-y-2">
            <label htmlFor="invite-name" className="text-sm font-medium">Name</label>
            <Input id="invite-name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <label htmlFor="invite-email" className="text-sm font-medium">Email</label>
            <Input id="invite-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <label htmlFor="invite-role" className="text-sm font-medium">Role</label>
            <Select value={role} onValueChange={(value) => setRole(value as Role)}>
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABEL) as Role[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {ROLE_LABEL[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
