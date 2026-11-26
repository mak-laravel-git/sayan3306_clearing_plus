import type { Metadata } from "next"

import { SeoJsonLd } from "@/components/seo/json-ld"
import { MarketingHero } from "@/components/site/marketing/marketing-hero"
import { PillLink } from "@/components/site/marketing/pill-link"
import { PreFooterBanner } from "@/components/site/marketing/pre-footer-banner"
import { SectionHeading } from "@/components/site/marketing/section-heading"
import { SectionReveal } from "@/components/site/marketing/section-reveal"
import { StepCardGrid } from "@/components/site/marketing/step-card-grid"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RouteReady } from "@/components/transitions/route-ready"
import { grassrootsPage } from "@/content/pages/grassroots"
import { site } from "@/content/site"
import { toMetadata } from "@/lib/seo/metadata"
import { fetchPageSeo } from "@/lib/seo/public"

const PATH = "/grassroots"

export async function generateMetadata(): Promise<Metadata> {
  return toMetadata(await fetchPageSeo(PATH))
}

export default async function GrassrootsPage() {
  const seo = await fetchPageSeo(PATH)

  return (
    <main id="content" tabIndex={-1} className="flex flex-1 flex-col">
      <RouteReady />
      <SeoJsonLd seo={seo} />
      <MarketingHero eyebrow={grassrootsPage.eyebrow} title={grassrootsPage.heading} lead={grassrootsPage.lead} />
      <section className="bg-cp-paper">
        <div className="cp-section">
          <SectionHeading eyebrow="Principles" title={grassrootsPage.principlesHeading} />
          <StepCardGrid className="mt-10 lg:grid-cols-4" items={grassrootsPage.principles} />
        </div>
      </section>
      <section className="bg-white">
        <div className="cp-section">
          <SectionHeading eyebrow="Reporting" title={grassrootsPage.tableHeading} lead={grassrootsPage.tableNote} />
          <SectionReveal className="mt-8 overflow-hidden rounded-3xl border border-cp-navy/10">
            <Table>
              <TableHeader>
                <TableRow className="bg-cp-paper hover:bg-cp-paper">
                  <TableHead>Period</TableHead>
                  <TableHead>Allocated</TableHead>
                  <TableHead>Focus</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grassrootsPage.rows.map((row) => (
                  <TableRow key={row.period}>
                    <TableCell className="font-medium text-cp-ink">{row.period}</TableCell>
                    <TableCell className="text-cp-primary">{row.allocated}</TableCell>
                    <TableCell className="text-cp-navy/80">{row.focus}</TableCell>
                    <TableCell className="text-cp-steel">{row.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionReveal>
        </div>
      </section>
      <PreFooterBanner
        className="my-10"
        title={grassrootsPage.cta.title}
        lead={grassrootsPage.cta.lead}
        actions={
          <PillLink href={site.email ? `mailto:${site.email}` : "/register"} variant="light" external={Boolean(site.email)}>
            Get in touch
          </PillLink>
        }
      />
    </main>
  )
}
