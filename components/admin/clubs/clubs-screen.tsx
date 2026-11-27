"use client";

import { Download, MailPlus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { sendActivationEmailsAction } from "@/app/(admin)/admin/clubs/actions";
import { ClubStatusBadge, EmailStatusBadge } from "@/components/admin/clubs/badges";
import { RouteReady } from "@/components/transitions/route-ready";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClubFilters } from "@/lib/admin/clubs";
import type { AdminClub, AdminClubList } from "@/lib/clubs/types";

const ANY = "all";

const STATUSES = [
  { value: "pre_registered", label: "Pre-registered" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

const EMAIL_STATUSES = [
  { value: "valid", label: "Email ready" },
  { value: "missing", label: "No email" },
  { value: "duplicate", label: "Shared email" },
  { value: "invalid", label: "Email to fix" },
];

const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const when = (value: string | null) => (value ? date.format(new Date(value)) : "—");

/**
 * Every club of the campaign with its onboarding: who has been emailed, who
 * opened the link, who activated and who still has to be checked. Sending to
 * a batch only reaches the clubs that should get it; the rest are listed back.
 */
export function ClubsScreen({
  list,
  filters,
  canSend,
  exportError,
}: {
  list: AdminClubList;
  filters: ClubFilters;
  canSend: boolean;
  exportError?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(filters.q ?? "");
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);

  const pageCodes = list.clubs.map((club) => club.code);
  const allOnPage = pageCodes.length > 0 && pageCodes.every((code) => selected.includes(code));

  function go(next: Partial<ClubFilters> & { page?: number }) {
    const merged = { ...filters, ...next };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.status) params.set("status", merged.status);
    if (merged.email_status) params.set("email_status", merged.email_status);
    if (merged.unreviewed) params.set("unreviewed", "1");
    if (merged.emailed) params.set("emailed", merged.emailed);
    if (merged.page && merged.page > 1) params.set("page", String(merged.page));
    setSelected([]);
    router.push(`/admin/clubs${params.size ? `?${params}` : ""}`);
  }

  function exportHref() {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.status) params.set("status", filters.status);
    if (filters.email_status) params.set("email_status", filters.email_status);
    if (filters.unreviewed) params.set("unreviewed", "1");
    if (filters.emailed) params.set("emailed", filters.emailed === "yes" ? "1" : "0");

    return `/api/admin/clubs/export${params.size ? `?${params}` : ""}`;
  }

  function send() {
    startTransition(async () => {
      const result = await sendActivationEmailsAction(selected, false);
      setConfirm(false);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message, { duration: 8000 });
      setSelected([]);
      router.refresh();
    });
  }

  const s = list.summary;
  const tiles = [
    { label: "Clubs", value: s.total, hint: `${s.pre_registered} waiting`, on: () => go({ status: "", email_status: "", unreviewed: false, emailed: "", page: 1 }) },
    { label: "Activated", value: s.active, hint: `${s.unreviewed} not checked yet`, on: () => go({ status: "active", page: 1 }) },
    { label: "Emailed", value: s.emailed, hint: `${s.link_opened} opened the link`, on: () => go({ emailed: "yes", page: 1 }) },
    { label: "Need an email", value: s.without_usable_email, hint: "missing, shared or invalid", on: () => go({ email_status: "missing", page: 1 }) },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <RouteReady />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Workspace</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Clubs</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            The pre-registered clubs of the outreach list and the clubs that activated. Check every activation, fix missing emails and send the activation invitations.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href={exportHref()}>
            <Download data-icon="inline-start" aria-hidden />
            Export CSV
          </a>
        </Button>
      </header>

      {exportError ? <p className="text-sm text-destructive">{exportError}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <button
            key={tile.label}
            type="button"
            onClick={tile.on}
            className="rounded-2xl border border-border/70 bg-card/70 p-5 text-left shadow-sm transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-ring"
          >
            <p className="text-sm text-muted-foreground">{tile.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{tile.value.toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">{tile.hint}</p>
          </button>
        ))}
      </div>

      <form
        className="flex flex-wrap items-center gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          go({ q: query, page: 1 });
        }}
      >
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search club, club ID or email" className="pl-9" aria-label="Search clubs" />
        </div>
        <Select value={filters.status || ANY} onValueChange={(value) => go({ status: value === ANY ? "" : value, page: 1 })}>
          <SelectTrigger className="w-44" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any status</SelectItem>
            {STATUSES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.email_status || ANY} onValueChange={(value) => go({ email_status: value === ANY ? "" : value, page: 1 })}>
          <SelectTrigger className="w-44" aria-label="Filter by email">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any email</SelectItem>
            {EMAIL_STATUSES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.emailed || ANY} onValueChange={(value) => go({ emailed: value === ANY ? "" : (value as "yes" | "no"), page: 1 })}>
          <SelectTrigger className="w-44" aria-label="Filter by invitation">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Emailed or not</SelectItem>
            <SelectItem value="yes">Emailed</SelectItem>
            <SelectItem value="no">Not emailed</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-foreground" checked={Boolean(filters.unreviewed)} onChange={(event) => go({ unreviewed: event.target.checked, page: 1 })} />
          Not checked yet
        </label>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {canSend && selected.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/50 px-4 py-3 text-sm" role="status">
          <span>{selected.length} selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
              Clear
            </Button>
            <Button size="sm" onClick={() => setConfirm(true)}>
              <MailPlus data-icon="inline-start" aria-hidden />
              Send activation emails
            </Button>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card/70 shadow-sm">
        <table className="w-full min-w-[60rem] text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              {canSend ? (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="size-4 accent-foreground"
                    aria-label="Select every club on this page"
                    checked={allOnPage}
                    onChange={(event) => setSelected(event.target.checked ? [...new Set([...selected, ...pageCodes])] : selected.filter((code) => !pageCodes.includes(code)))}
                  />
                </th>
              ) : null}
              <th className="px-4 py-3 font-medium">Club</th>
              <th className="px-4 py-3 font-medium">League</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Official email</th>
              <th className="px-4 py-3 font-medium">Emailed</th>
              <th className="px-4 py-3 font-medium">Opened</th>
              <th className="px-4 py-3 font-medium">Activated</th>
            </tr>
          </thead>
          <tbody>
            {list.clubs.length === 0 ? (
              <tr>
                <td colSpan={canSend ? 8 : 7} className="px-4 py-10 text-center text-muted-foreground">
                  No clubs match.
                </td>
              </tr>
            ) : null}
            {list.clubs.map((club) => (
              <ClubRow
                key={club.code}
                club={club}
                selectable={canSend}
                selected={selected.includes(club.code)}
                onToggle={(on) => setSelected(on ? [...selected, club.code] : selected.filter((code) => code !== club.code))}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {list.meta.total.toLocaleString()} club{list.meta.total === 1 ? "" : "s"}
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

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send {selected.length} activation email{selected.length === 1 ? "" : "s"}?</DialogTitle>
            <DialogDescription>
              Each club gets one email at its official address with the link to activate. Clubs that are not waiting for activation, have no usable email, asked not to be
              contacted or were already emailed are skipped and listed afterwards. A batch is spread out over a few minutes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(false)} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={send} disabled={pending}>
              {pending ? "Sending…" : "Send emails"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClubRow({ club, selectable, selected, onToggle }: { club: AdminClub; selectable: boolean; selected: boolean; onToggle: (on: boolean) => void }) {
  return (
    <tr className="border-b last:border-0">
      {selectable ? (
        <td className="px-4 py-3">
          <input type="checkbox" className="size-4 accent-foreground" aria-label={`Select ${club.name}`} checked={selected} onChange={(event) => onToggle(event.target.checked)} />
        </td>
      ) : null}
      <td className="px-4 py-3">
        <Link href={`/admin/clubs/${club.code}`} className="font-medium underline-offset-4 hover:underline">
          {club.name}
        </Link>
        <div className="font-mono text-xs text-muted-foreground">
          {club.code} {club.is_demo ? <Badge variant="outline" className="ml-1">demo</Badge> : null}
        </div>
      </td>
      <td className="px-4 py-3">
        <div>{club.league}</div>
        <div className="text-xs text-muted-foreground">{club.country}</div>
      </td>
      <td className="px-4 py-3">
        <ClubStatusBadge status={club.status} />
        {club.status === "active" && !club.activation_reviewed_at ? <Badge variant="secondary" className="ml-2">check</Badge> : null}
      </td>
      <td className="px-4 py-3">
        <div className="max-w-[14rem] truncate">{club.official_email ?? "—"}</div>
        <EmailStatusBadge status={club.email_status} />
      </td>
      <td className="px-4 py-3 text-muted-foreground">{when(club.activation_email_sent_at)}</td>
      <td className="px-4 py-3 text-muted-foreground">{when(club.activation_link_opened_at)}</td>
      <td className="px-4 py-3 text-muted-foreground">{when(club.activated_at)}</td>
    </tr>
  );
}
