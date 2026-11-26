"use client";

import { Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { selectAdminSiteAction } from "@/app/(admin)/admin/application/site-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminSite } from "@/lib/admin/site";

/** Screens that belong to the whole platform, not to one site. */
const SHARED = ["/admin/application/backup", "/admin/application/audit"];

function caption(pathname: string, site: AdminSite): string {
  if (pathname.startsWith("/admin/application/smtp")) {
    return `The mail server is the same for every site. The sender below is for ${site.name}.`;
  }
  if (pathname === "/admin/application") {
    return `Name, logo, favicon and sign-up are for ${site.name}. Audit retention applies to every site.`;
  }
  return `Everything on this screen is for ${site.name} only.`;
}

export function SiteBar({ sites, current }: { sites: AdminSite[]; current: AdminSite }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (SHARED.some((prefix) => pathname.startsWith(prefix))) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <Globe className="size-4" aria-hidden />
        This screen applies to every site.
      </div>
    );
  }

  if (sites.length < 2) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Managing</span>
        <p className="text-sm text-muted-foreground">{caption(pathname, current)}</p>
      </div>
      <div className="flex items-center gap-3">
        {current.origin ? (
          <span className="hidden truncate text-xs text-muted-foreground md:inline">{current.origin}</span>
        ) : null}
        <Select
          value={current.key}
          disabled={pending}
          onValueChange={(key) =>
            startTransition(async () => {
              const result = await selectAdminSiteAction(key);
              if (!result.ok) {
                toast.error(result.message);
                return;
              }
              router.refresh();
            })
          }
        >
          <SelectTrigger className="w-44" aria-label="Site to manage">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sites.map((site) => (
              <SelectItem key={site.key} value={site.key}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
