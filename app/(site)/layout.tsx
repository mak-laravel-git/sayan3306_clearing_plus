import type { ReactNode } from "react"

import { JsonLd } from "@/components/seo/json-ld"
import { TrafficReporter } from "@/components/seo/traffic-reporter"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"
import { fetchPageSeo } from "@/lib/seo/public"
import { siteStructuredData } from "@/lib/structured-data"

/** Site-level schema (owner + WebSite) belongs to the public pages only, never to login or admin. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const home = await fetchPageSeo("/")

  return (
    <div className="flex min-h-svh flex-1 flex-col bg-muted/30">
      <JsonLd data={siteStructuredData(home.identity, home.description)} />
      {home.identity.tracking_enabled ? <TrafficReporter /> : null}
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  )
}
