import type { Metadata } from "next"
import { SeoJsonLd } from "@/components/seo/json-ld"
import { FeatureCardGrid } from "@/components/site/marketing/feature-card-grid"
import { FeeCalculator } from "@/components/site/marketing/fee-calculator"
import { MarketingHero } from "@/components/site/marketing/marketing-hero"
import { PillLink } from "@/components/site/marketing/pill-link"
import { PreFooterBanner } from "@/components/site/marketing/pre-footer-banner"
import { SectionHeading } from "@/components/site/marketing/section-heading"
import { RouteReady } from "@/components/transitions/route-ready"
import { clubsPage } from "@/content/pages/clubs"
import { toMetadata } from "@/lib/seo/metadata"
import { fetchPageSeo } from "@/lib/seo/public"

const PATH = "/clubs"

export async function generateMetadata(): Promise<Metadata> {
  return toMetadata(await fetchPageSeo(PATH))
}

export default async function ClubsPage() {
  const seo = await fetchPageSeo(PATH)

  return (
    <main id="content" tabIndex={-1} className="flex flex-1 flex-col">
      <RouteReady />
      <SeoJsonLd seo={seo} />
      <MarketingHero
        eyebrow={clubsPage.eyebrow}
        title={clubsPage.heading}
        lead={clubsPage.lead}
        actions={
          <>
            <PillLink href="/register" variant="light">
              Register your club
            </PillLink>
            <PillLink href="/founding-clubs" variant="outline">
              Founding Clubs
            </PillLink>
          </>
        }
      />
      <section className="bg-cp-paper">
        <div className="cp-section">
          <SectionHeading eyebrow="Tools" title={clubsPage.toolsHeading} />
          <FeatureCardGrid
            className="mt-10"
            items={clubsPage.tools.map((item, index) => ({
              ...item,
              icon: (["search","badgeCheck","film","clipboardList","users","workflow"] as const)[index],
            }))}
          />
        </div>
      </section>
      <section className="bg-white">
        <div className="cp-section">
          <SectionHeading eyebrow="Fees" title={clubsPage.feesHeading} lead={clubsPage.feesLead} />
          <div className="mt-10">
            <FeeCalculator />
          </div>
        </div>
      </section>
      <PreFooterBanner
        className="my-10"
        title={clubsPage.cta.title}
        lead={clubsPage.cta.lead}
        actions={
          <>
            <PillLink href="/register" variant="light">
              Register Interest
            </PillLink>
            <PillLink href="/founding-clubs" variant="outline">
              Apply as founding club
            </PillLink>
          </>
        }
      />
    </main>
  )
}
