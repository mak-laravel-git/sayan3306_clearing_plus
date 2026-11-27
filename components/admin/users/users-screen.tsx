"use client";

import { MoreHorizontal, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  changeRoleAction,
  createUserAction,
  reinstateUserAction,
  resendInvitationAction,
  setExtraPpmAction,
  suspendUserAction,
  type UsersResult,
} from "@/app/(admin)/admin/users/actions";
import { RouteReady } from "@/components/transitions/route-ready";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ManagedUser, UserList } from "@/lib/admin/users";
import type { UserRole } from "@/types/auth";

/** Every role, for the filter and for showing what a person is. */
const ALL_ROLES: { value: UserRole; label: string }[] = [
  { value: "platform_super_admin", label: "Platform super admin" },
  { value: "platform_admin", label: "Platform admin" },
  { value: "ppm", label: "Player placement manager" },
  { value: "player", label: "Player" },
  { value: "guardian", label: "Guardian" },
  { value: "club_admin", label: "Club admin" },
  { value: "club_user", label: "Club user" },
  { value: "employer", label: "Employer" },
];

/** What can be chosen when creating an account or changing a role: a club person comes only with a club (invited from it). */
const ROLES = ALL_ROLES.filter((role) => role.value !== "club_admin" && role.value !== "club_user");

const PLATFORM_STAFF: readonly UserRole[] = ["platform_super_admin", "platform_admin"];
const CLUB_ROLES: readonly UserRole[] = ["club_admin", "club_user"];

const ANY = "all";

function roleLabel(role: string | null): string {
  return ALL_ROLES.find((item) => item.value === role)?.label ?? "No role";
}

function StatusBadge({ status }: { status: ManagedUser["status"] }) {
  if (status === "suspended") return <Badge variant="destructive">Suspended</Badge>;
  if (status === "unverified") return <Badge variant="secondary">Not verified</Badge>;
  return <Badge variant="outline">Active</Badge>;
}

type Dialogs = { kind: "create" } | { kind: "role"; user: ManagedUser } | null;

export function UsersScreen({
  list,
  meId,
  canManage,
  canAssign,
  filters,
}: {
  list: UserList;
  meId: string;
  canManage: boolean;
  canAssign: boolean;
  filters: { q: string; role: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<Dialogs>(null);
  const [query, setQuery] = useState(filters.q);

  function go(next: { q?: string; role?: string; page?: number }) {
    const params = new URLSearchParams();
    const q = next.q ?? filters.q;
    const role = next.role ?? filters.role;
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    if (next.page && next.page > 1) params.set("page", String(next.page));
    router.push(`/admin/users${params.size ? `?${params}` : ""}`);
  }

  function run(work: () => Promise<UsersResult>, after?: () => void) {
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

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <RouteReady />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Workspace</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Users &amp; roles</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Create accounts, change roles and suspend access. Every change is in the audit log.
          </p>
        </div>
        {canManage ? (
          <Button onClick={() => setDialog({ kind: "create" })}>
            <Plus data-icon="inline-start" aria-hidden />
            New account
          </Button>
        ) : null}
      </header>

      <form
        className="flex flex-wrap items-center gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          go({ q: query, page: 1 });
        }}
      >
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or email" className="pl-9" aria-label="Search users" />
        </div>
        <Select value={filters.role || ANY} onValueChange={(value) => go({ role: value === ANY ? "" : value, page: 1 })}>
          <SelectTrigger className="w-56" aria-label="Filter by role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All roles</SelectItem>
            {ALL_ROLES.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card/70 shadow-sm">
        <table className="w-full min-w-[44rem] text-sm">
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
            {list.users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No accounts match.
                </td>
              </tr>
            ) : null}
            {list.users.map((user) => {
              const mine = String(user.id) === meId;
              const isAdmin = user.role !== null && PLATFORM_STAFF.includes(user.role);
              const isClubPerson = user.role !== null && CLUB_ROLES.includes(user.role);
              const alsoPpm = user.roles.includes("ppm") && isAdmin;

              return (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {user.name} {mine ? <span className="text-xs font-normal text-muted-foreground">(you)</span> : null}
                    </div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {roleLabel(user.role)}
                    {alsoPpm ? <Badge variant="outline" className="ml-2">also PPM</Badge> : null}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.two_factor_enabled ? "On" : "Off"}</td>
                  <td className="px-4 py-3 text-right">
                    {canManage || canAssign ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${user.name}`} disabled={pending}>
                            <MoreHorizontal aria-hidden />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canAssign && !mine && !isClubPerson ? (
                            <DropdownMenuItem onSelect={() => setDialog({ kind: "role", user })}>Change role…</DropdownMenuItem>
                          ) : null}
                          {canAssign && isAdmin ? (
                            <DropdownMenuItem onSelect={() => run(() => setExtraPpmAction(user.id, !alsoPpm))}>
                              {alsoPpm ? "Remove PPM role" : "Also work as a PPM"}
                            </DropdownMenuItem>
                          ) : null}
                          {canManage && user.status === "unverified" ? (
                            <DropdownMenuItem onSelect={() => run(() => resendInvitationAction(user.id))}>Send invitation again</DropdownMenuItem>
                          ) : null}
                          {canManage && !mine ? <DropdownMenuSeparator /> : null}
                          {canManage && !mine && user.status !== "suspended" ? (
                            <DropdownMenuItem variant="destructive" onSelect={() => run(() => suspendUserAction(user.id))}>
                              Suspend account
                            </DropdownMenuItem>
                          ) : null}
                          {canManage && user.status === "suspended" ? (
                            <DropdownMenuItem onSelect={() => run(() => reinstateUserAction(user.id))}>Reinstate account</DropdownMenuItem>
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

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {list.meta.total} account{list.meta.total === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={list.meta.current_page <= 1} onClick={() => go({ page: list.meta.current_page - 1 })}>
            Previous
          </Button>
          <span>
            Page {list.meta.current_page} of {list.meta.last_page}
          </span>
          <Button variant="outline" size="sm" disabled={list.meta.current_page >= list.meta.last_page} onClick={() => go({ page: list.meta.current_page + 1 })}>
            Next
          </Button>
        </div>
      </div>

      <CreateDialog
        open={dialog?.kind === "create"}
        onClose={() => setDialog(null)}
        pending={pending}
        onSubmit={(values) => run(() => createUserAction(values), () => setDialog(null))}
      />
      <RoleDialog
        user={dialog?.kind === "role" ? dialog.user : null}
        onClose={() => setDialog(null)}
        pending={pending}
        onSubmit={(role) => dialog?.kind === "role" && run(() => changeRoleAction(dialog.user.id, role), () => setDialog(null))}
      />
    </div>
  );
}

function CreateDialog({
  open,
  onClose,
  pending,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  pending: boolean;
  onSubmit: (values: { name: string; email: string; role: string }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New account</DialogTitle>
          <DialogDescription>
            The person gets an email with a code. They confirm their address with it and choose their own password.
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
            <label htmlFor="new-name" className="text-sm font-medium">Name</label>
            <Input id="new-name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <label htmlFor="new-email" className="text-sm font-medium">Email</label>
            <Input id="new-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <label htmlFor="new-role" className="text-sm font-medium">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="new-role" className="w-full">
                <SelectValue placeholder="Choose a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !role}>
              {pending ? "Creating…" : "Create and invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RoleDialog({
  user,
  onClose,
  pending,
  onSubmit,
}: {
  user: ManagedUser | null;
  onClose: () => void;
  pending: boolean;
  onSubmit: (role: string) => void;
}) {
  const [role, setRole] = useState<string | null>(null);
  const current = role ?? user?.role ?? "";

  return (
    <Dialog open={user !== null} onOpenChange={(next) => !next && (setRole(null), onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>
            {user ? `${user.name} works as ${roleLabel(user.role)}. ` : ""}A person has one role. The new role applies at once, and if
            their current site no longer serves it, their session ends.
          </DialogDescription>
        </DialogHeader>
        <Select value={current} onValueChange={setRole}>
          <SelectTrigger className="w-full" aria-label="New role">
            <SelectValue placeholder="Choose a role" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="ghost" onClick={() => (setRole(null), onClose())} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={() => onSubmit(current)} disabled={pending || !current || current === user?.role}>
            {pending ? "Saving…" : "Save role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
