"use client";

import { Info } from "lucide-react";
import { type ReactNode, useState, useTransition } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import {
  loadSeoTrafficAction,
  saveSeoTrafficEnabledAction,
} from "@/app/(admin)/admin/application/seo-traffic/actions";
import { ApplicationSectionHeader } from "@/components/admin/application/application-settings";
import { ChartEmpty, ChartPanel, useChartAnimation } from "@/components/admin/charts/chart-panel";
import { formatDateTime } from "@/components/admin/devices/device-meta";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CrawlerVerification, SeoTraffic, VitalName } from "@/lib/admin/seo-traffic-types";
import { useDisplayTimeZone } from "@/lib/datetime/timezone";

const RANGES = [7, 14, 28, 90];

const chartConfig = {
  views: { label: "Page views", color: "var(--chart-1)" },
  visitors: { label: "Visitors", color: "var(--chart-2)" },
} satisfies ChartConfig;

const SOURCE_LABELS: Record<string, string> = {
  direct: "Direct",
  internal: "Internal",
  search: "Search engines",
  social: "Social",
  ai: "AI assistants",
  referral: "Other websites",
};

const VERIFICATION_LABELS: Record<CrawlerVerification, string> = {
  verified: "Verified by DNS",
  unverified: "Failed the DNS check",
  unknown: "Cannot be verified",
};

const VITAL_LABELS: Record<VitalName, { label: string; unit: "ms" | ""; good: string }> = {
  LCP: { label: "Largest Contentful Paint", unit: "ms", good: "2.5 s or less" },
  INP: { label: "Interaction to Next Paint", unit: "ms", good: "200 ms or less" },
  CLS: { label: "Cumulative Layout Shift", unit: "", good: "0.1 or less" },
  FCP: { label: "First Contentful Paint", unit: "ms", good: "1.8 s or less" },
  TTFB: { label: "Time to First Byte", unit: "ms", good: "800 ms or less" },
};

function formatVital(metric: VitalName, value: number | null) {
  if (value === null) return "—";
  return metric === "CLS" ? value.toFixed(3) : `${Math.round(value)} ms`;
}

function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/70">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>
            {head.map((label, index) => (
              <th key={label} className={`px-3 py-2 font-medium ${index > 0 ? "text-right" : ""}`}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">{children}</tbody>
      </table>
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">{children}</p>;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border/70 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function DailyChart({ traffic }: { traffic: SeoTraffic }) {
  const animate = useChartAnimation();
  const hasData = traffic.daily.some((day) => day.views > 0);

  if (!hasData) return <ChartEmpty>No page views recorded in this period.</ChartEmpty>;

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <AreaChart data={traffic.daily} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickFormatter={(value: string) => value.slice(5)} minTickGap={24} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area dataKey="views" type="monotone" stroke="var(--color-views)" fill="var(--color-views)" fillOpacity={0.15} isAnimationActive={animate} />
        <Area dataKey="visitors" type="monotone" stroke="var(--color-visitors)" fill="var(--color-visitors)" fillOpacity={0.1} isAnimationActive={animate} />
      </AreaChart>
    </ChartContainer>
  );
}

export function SeoTrafficScreen({ initial }: { initial: SeoTraffic }) {
  const [traffic, setTraffic] = useState(initial);
  const [pending, startTransition] = useTransition();
  const timeZone = useDisplayTimeZone();
  const { status, totals } = traffic;

  function reload(days: number) {
    startTransition(async () => {
      const result = await loadSeoTrafficAction(days);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setTraffic(result.traffic);
    });
  }

  function toggle(enabled: boolean) {
    startTransition(async () => {
      const result = await saveSeoTrafficEnabledAction(enabled);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setTraffic(result.traffic);
      toast.success(result.message);
    });
  }

  const organicShare = totals.views > 0 ? Math.round((totals.organic_views / totals.views) * 100) : 0;
  const verifiedHits = traffic.crawlers.bots.filter((bot) => bot.verification === "verified").reduce((sum, bot) => sum + bot.hits, 0);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <ApplicationSectionHeader section="seo-traffic">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="traffic-enabled"
              checked={status.setting_enabled}
              onCheckedChange={toggle}
              disabled={pending || !status.module_enabled}
              aria-label="Monitor site traffic and crawlers"
            />
            <Label htmlFor="traffic-enabled">Monitoring {status.setting_enabled ? "on" : "off"}</Label>
          </div>
          <Select value={String(status.days)} onValueChange={(value) => reload(Number(value))} disabled={pending}>
            <SelectTrigger className="w-36" aria-label="Period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGES.map((days) => (
                <SelectItem key={days} value={String(days)}>
                  Last {days} days
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </ApplicationSectionHeader>

      {!status.enabled ? (
        <Alert>
          <Info aria-hidden />
          <AlertTitle>Monitoring is off</AlertTitle>
          <AlertDescription>
            Nothing is being recorded. Turn it on only after the client has confirmed the privacy position for this site. When it
            is on, pages report a view without cookies and without storing an IP address, user agent or visitor id.
          </AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="overview" className="gap-4">
        <TabsList className="w-full flex-wrap sm:w-fit">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="crawlers">Crawlers</TabsTrigger>
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Page views" value={totals.views.toLocaleString()} />
            <Stat
              label="Visitor-days"
              value={totals.visitor_days.toLocaleString()}
              hint="A visitor who comes back on another day is counted again."
            />
            <Stat label="From search engines" value={`${organicShare}%`} hint={`${totals.organic_views.toLocaleString()} page views`} />
          </div>
          <ChartPanel title="Views and visitors per day" description={`Since ${status.from}. First-party data from public pages only.`}>
            <DailyChart traffic={traffic} />
          </ChartPanel>
          <section className="space-y-2 rounded-xl border border-border/70 bg-card/70 p-6">
            <h3 className="text-base font-semibold">Not measured here</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {status.not_measured.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {status.first_data_day ? (
              <p className="pt-1 text-xs text-muted-foreground">Data starts on {status.first_data_day}.</p>
            ) : null}
          </section>
        </TabsContent>

        <TabsContent value="pages">
          {traffic.pages.length === 0 ? (
            <Empty>No page views recorded in this period.</Empty>
          ) : (
            <Table head={["Page", "Views", "From search", "Visitor-days"]}>
              {traffic.pages.map((page) => (
                <tr key={page.path}>
                  <td className="max-w-xs truncate px-3 py-2 font-medium">{page.path}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{page.views.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{page.organic_views.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{page.visitor_days.toLocaleString()}</td>
                </tr>
              ))}
            </Table>
          )}
        </TabsContent>

        <TabsContent value="sources" className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground">
            Search engines do not pass the words people searched for, so only the engine is shown.
          </p>
          {traffic.sources.length === 0 ? (
            <Empty>No page views recorded in this period.</Empty>
          ) : (
            <Table head={["Source", "Views"]}>
              {traffic.sources.map((source) => (
                <tr key={`${source.type}:${source.host}`}>
                  <td className="px-3 py-2">
                    <span className="font-medium">{SOURCE_LABELS[source.type] ?? source.type}</span>
                    {source.host ? <span className="text-muted-foreground"> · {source.host}</span> : null}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{source.views.toLocaleString()}</td>
                </tr>
              ))}
            </Table>
          )}
          {traffic.devices.length > 0 ? (
            <Table head={["Device", "Views"]}>
              {traffic.devices.map((device) => (
                <tr key={device.device}>
                  <td className="px-3 py-2 font-medium capitalize">{device.device}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{device.views.toLocaleString()}</td>
                </tr>
              ))}
            </Table>
          ) : null}
        </TabsContent>

        <TabsContent value="crawlers" className="flex flex-col gap-6">
          <p className="text-sm text-muted-foreground">
            Requests by search and AI crawlers. Google and Bing are checked by reverse and forward DNS. Other crawlers cannot be
            verified, so their user agent is taken as stated. A request is not proof that a page was indexed. {verifiedHits.toLocaleString()} verified
            requests in this period.
          </p>
          {traffic.crawlers.bots.length === 0 ? (
            <Empty>No crawler requests recorded in this period.</Empty>
          ) : (
            <Table head={["Crawler", "Check", "Requests", "Last seen"]}>
              {traffic.crawlers.bots.map((bot) => (
                <tr key={`${bot.bot}:${bot.verification}`}>
                  <td className="px-3 py-2 font-medium">{bot.bot}</td>
                  <td className="px-3 py-2 text-right">
                    <Badge variant={bot.verification === "unverified" ? "destructive" : "outline"}>
                      {VERIFICATION_LABELS[bot.verification]}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{bot.hits.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{formatDateTime(bot.last_seen_at, timeZone)}</td>
                </tr>
              ))}
            </Table>
          )}
          {traffic.crawlers.pages.length > 0 ? (
            <>
              <h4 className="text-sm font-semibold">Pages requested by verified crawlers</h4>
              <Table head={["Page", "Requests", "Last seen"]}>
                {traffic.crawlers.pages.map((page) => (
                  <tr key={page.path}>
                    <td className="max-w-xs truncate px-3 py-2 font-medium">{page.path}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{page.hits.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{formatDateTime(page.last_seen_at, timeZone)}</td>
                  </tr>
                ))}
              </Table>
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="vitals" className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Measured in the browsers of this site&apos;s own visitors, 75th percentile over the last 28 days. This is not Google&apos;s
            data and not a Lighthouse score.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {traffic.vitals.map((vital) => (
              <div key={vital.metric} className="space-y-2 rounded-xl border border-border/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{VITAL_LABELS[vital.metric].label}</p>
                    <p className="text-xs text-muted-foreground">Good: {VITAL_LABELS[vital.metric].good}</p>
                  </div>
                  <p className="text-xl font-semibold tabular-nums">{formatVital(vital.metric, vital.p75)}</p>
                </div>
                {vital.samples === 0 ? (
                  <p className="text-xs text-muted-foreground">No measurements yet.</p>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {vital.good}% good · {vital.needs_improvement}% needs improvement · {vital.poor}% poor · {vital.samples.toLocaleString()} measurements
                    </p>
                    {vital.slowest_pages.length > 0 ? (
                      <ul className="space-y-0.5 text-xs">
                        {vital.slowest_pages.map((page) => (
                          <li key={page.path} className="flex justify-between gap-3">
                            <span className="truncate">{page.path}</span>
                            <span className="tabular-nums text-muted-foreground">{formatVital(vital.metric, page.p75)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
