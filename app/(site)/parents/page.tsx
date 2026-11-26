import type { Metadata } from "next"
import { SeoJsonLd } from "@/components/seo/json-ld"
import { FeatureCardGrid } from "@/components/site/marketing/feature-card-grid"
import { MarketingHero } from "@/components/site/marketing/marketing-hero"
import { PillLink } from "@/components/site/marketing/pill-link"
import { PreFooterBanner } from "@/components/site/marketing/pre-footer-banner"
import { SectionHeading } from "@/components/site/marketing/section-heading"
import { StepCardGrid } from "@/components/site/marketing/step-card-grid"
import { RouteReady } from "@/components/transitions/route-ready"
import { parentsPage } from "@/content/pages/parents"
import { site } from "@/content/site"
import { toMetadata } from "@/lib/seo/metadata"
import { fetchPageSeo } from "@/lib/seo/public"

const PATH = "/parents"

export async function generateMetadata(): Promise<Metadata> {
  return toMetadata(await fetchPageSeo(PATH))
}

export default async function ParentsPage() {
  const seo = await fetchPageSeo(PATH)

  return (
    <main id="content" tabIndex={-1} className="flex flex-1 flex-col">
      <RouteReady />
      <SeoJsonLd seo={seo} />
      <MarketingHero
        eyebrow={parentsPage.eyebrow}
        title={parentsPage.heading}
        lead={parentsPage.lead}
        actions={
          <>
            <PillLink href="/register" variant="light">
              Preview guardian dashboard
            </PillLink>
            <PillLink href={site.email ? `mailto:${site.email}` : "/register"} variant="outline" external={Boolean(site.email)}>
              Talk to our team
            </PillLink>
          </>
        }
      />
      <section className="bg-cp-paper">
        <div className="cp-section">
          <SectionHeading eyebrow="Consent" title={parentsPage.consentHeading} />
          <StepCardGrid className="mt-10" items={parentsPage.consentSteps} />
        </div>
      </section>
      <section className="bg-cp-navy text-white">
        <div className="cp-section">
          <SectionHeading light eyebrow="Safeguarding" title={parentsPage.safeguardingHeading} />
          <FeatureCardGrid
            className="mt-10"
            tone="dark"
            items={parentsPage.safeguarding.map((item, index) => ({
              ...item,
              icon: (["userCheck","eyeOff","fileLock2","messagesSquare","shieldCheck","alertTriangle"] as const)[index],
            }))}
          />
          <p className="mt-8 rounded-2xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-100">
            {parentsPage.emergency}
          </p>
        </div>
      </section>
      <PreFooterBanner
        className="my-10"
        title={parentsPage.dashboardCta.title}
        lead={parentsPage.dashboardCta.lead}
        actions={<PillLink href="/register" variant="light">Register Interest</PillLink>}
      />
    </main>
  )
}
