import { formatDateTime } from "@/components/admin/devices/device-meta";
import { Badge } from "@/components/ui/badge";
import type { SeoJobStatus } from "@/lib/admin/seo-types";

/**
 * When each scheduled SEO job last ran. A job past its window means the queue
 * worker or the scheduler is not running, so sitemap and audit data is stale.
 */
export function SeoJobsCard({ jobs, timeZone }: { jobs: SeoJobStatus[]; timeZone: string }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/70 p-6">
      <div>
        <h3 className="text-base font-semibold">Scheduled SEO jobs</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          If a job is overdue, the queue worker or scheduler is not running and the data on this page may be old.
        </p>
      </div>
      <ul className="divide-y divide-border/70">
        {jobs.map((job) => (
          <li key={job.job} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
            <span className="font-medium">{job.label}</span>
            <span className="flex items-center gap-2 text-muted-foreground">
              {job.last_run_at ? formatDateTime(job.last_run_at, timeZone) : "Has not run yet"}
              {job.overdue ? <Badge variant="destructive">Overdue</Badge> : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
