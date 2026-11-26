import { CheckCircle2, CircleSlash, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { SeoAuditScopeInfo, SeoCheckBasis } from "@/lib/admin/seo-audit-types";

export const BASIS_LABELS: Record<SeoCheckBasis, string> = {
  google: "Google guideline",
  standard: "Standard",
  heuristic: "Best practice",
};

export const BASIS_HINTS: Record<SeoCheckBasis, string> = {
  google: "A documented Google Search guideline.",
  standard: "A published specification such as RFC 9309, sitemaps.org or Open Graph.",
  heuristic: "A best practice or checker convention. Google does not rank on it.",
};

/** The same wording everywhere a basis is shown. */
export function BasisBadge({ basis }: { basis: SeoCheckBasis }) {
  return (
    <Badge variant="outline" title={BASIS_HINTS[basis]}>
      {BASIS_LABELS[basis]}
    </Badge>
  );
}

const TYPE_LABELS: Record<string, string> = {};

function typeLabel(type: string) {
  return TYPE_LABELS[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * What this report analyses and what it does not. Generated from the same
 * check catalog the scanner runs, so it cannot claim more than the scan does.
 */
export function ScopePanel({ scope }: { scope: SeoAuditScopeInfo | undefined }) {
  if (!scope) return null;

  const total = scope.analysed.reduce((count, group) => count + group.checks.length, 0);
  const snapshot = scope.snapshot;
  const limited = snapshot?.types.filter((type) => type.limited) ?? [];

  return (
    <section className="space-y-5 rounded-xl border border-border/70 bg-card/70 p-6" aria-labelledby="seo-scope-title">
      <div>
        <h3 id="seo-scope-title" className="text-base font-semibold">
          What this report covers
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          This is a technical check of the pages of this site. It reads the HTML the server sends, robots.txt, the sitemap and the
          site settings. Everything it does not look at is listed below.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
            Analysed ({total} checks)
          </h4>
          <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
            {(Object.keys(scope.bases) as SeoCheckBasis[]).map((basis) => (
              <span key={basis} className="inline-flex items-center gap-1.5">
                <BasisBadge basis={basis} />
                {BASIS_HINTS[basis]}
              </span>
            ))}
          </div>
          <div className="space-y-2">
            {scope.analysed.map((group) => (
              <details key={group.section} className="rounded-lg border border-border/70 px-3 py-2">
                <summary className="cursor-pointer text-sm font-medium">
                  {group.label} <span className="text-muted-foreground">· {group.checks.length} checks</span>
                </summary>
                <ul className="mt-2 space-y-1.5">
                  {group.checks.map((check) => (
                    <li key={check.key} className="flex items-start justify-between gap-3 text-xs">
                      <span>{check.label}</span>
                      <BasisBadge basis={check.basis} />
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <CircleSlash className="size-4 text-muted-foreground" aria-hidden />
            Not analysed
          </h4>
          <ul className="space-y-1.5 text-sm">
            {scope.not_analysed.map((item) => (
              <li key={item.key} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" aria-hidden />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-2 rounded-lg bg-muted/40 p-4 text-sm">
        <h4 className="flex items-center gap-2 font-semibold">
          <Info className="size-4" aria-hidden />
          Limits of the latest scan
        </h4>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li>
            Up to {scope.limits.limit_per_type} pages are scanned for each content type, {scope.limits.max_links} links and{" "}
            {scope.limits.max_images} images are checked on each page, and {scope.limits.sitemap_url_limit} sitemap URLs are
            fetched.
          </li>
          {limited.map((type) => (
            <li key={type.type} className="font-medium text-foreground">
              {typeLabel(type.type)}: {type.scanned} of {type.total} pages scanned in the latest audit.
            </li>
          ))}
          {snapshot?.indexing_blocked ? (
            <li className="font-medium text-foreground">
              Indexing is blocked on purpose in the {snapshot.environment} environment, so checks that judge whether pages can be
              indexed are not scored.
            </li>
          ) : null}
          {snapshot?.environment === "development" ? (
            <li>This was a development scan: HTTPS, compression, headers and speed are not scored.</li>
          ) : null}
          {!snapshot ? <li>No completed audit yet.</li> : null}
        </ul>
      </div>
    </section>
  );
}
