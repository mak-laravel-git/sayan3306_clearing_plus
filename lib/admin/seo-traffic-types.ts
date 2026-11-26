export type TrafficSourceType = "direct" | "internal" | "search" | "social" | "ai" | "referral";
export type CrawlerVerification = "verified" | "unverified" | "unknown";
export type VitalName = "LCP" | "INP" | "CLS" | "FCP" | "TTFB";

export type SeoTraffic = {
  status: {
    /** Module on and an admin switched monitoring on. */
    enabled: boolean;
    module_enabled: boolean;
    setting_enabled: boolean;
    days: number;
    from: string;
    first_data_day: string | null;
    /** What this screen does not measure, one plain line each. */
    not_measured: string[];
  };
  totals: { views: number; visitor_days: number; organic_views: number };
  daily: { day: string; views: number; visitors: number }[];
  sources: { type: TrafficSourceType; host: string; views: number }[];
  devices: { device: "mobile" | "tablet" | "desktop"; views: number }[];
  pages: { path: string; views: number; organic_views: number; visitor_days: number }[];
  crawlers: {
    bots: { bot: string; verification: CrawlerVerification; hits: number; last_seen_at: string | null }[];
    pages: { path: string; hits: number; last_seen_at: string | null }[];
  };
  vitals: {
    metric: VitalName;
    samples: number;
    /** Milliseconds, except CLS (unitless). Null while there are no samples. */
    p75: number | null;
    good: number | null;
    needs_improvement: number | null;
    poor: number | null;
    slowest_pages: { path: string; samples: number; p75: number }[];
  }[];
};
