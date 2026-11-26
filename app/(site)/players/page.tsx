import type { Metadata } from "next"
import { SeoJsonLd } from "@/components/seo/json-ld"
import { FaqAccordion } from "@/components/site/marketing/faq-accordion"
import { FeatureCardGrid } from "@/components/site/marketing/feature-card-grid"
import { MarketingHero } from "@/components/site/marketing/marketing-hero"
import { PillLink } from "@/components/site/marketing/pill-link"
import { PricingTiers } from "@/components/site/marketing/pricing-tiers"
import { PrivacyCompare } from "@/components/site/marketing/privacy-compare"
import { SectionHeading } from "@/components/site/marketing/section-heading"
import { RouteReady } from "@/components/transitions/route-ready"
import { playersPage } from "@/content/pages/players"
import { playerPricingTiers } from "@/content/pricing"
import { toMetadata } from "@/lib/seo/metadata"
import { fetchPageSeo } from "@/lib/seo/public"

const PATH = "/players"

export async function generateMetadata(): Promise<Metadata> {
  return toMetadata(await fetchPageSeo(PATH))
}

export default async function PlayersPage() {
  const seo = await fetchPageSeo(PATH)

  return (
    <main id="content" tabIndex={-1} className="flex flex-1 flex-col">
      <RouteReady />
      <SeoJsonLd seo={seo} />
      <MarketingHero
        eyebrow={playersPage.eyebrow}
        title={playersPage.heading}
        lead={playersPage.lead}
        actions={
          <>
            <PillLink href="/register" variant="light">
              Create your profile
            </PillLink>
            <PillLink href="/how-it-works" variant="outline">
              How it works
            </PillLink>
          </>
        }
      />
      <section className="bg-cp-paper">
        <div className="cp-section">
          <SectionHeading eyebrow="What you get" title={playersPage.featuresHeading} />
          <FeatureCardGrid
            className="mt-10"
            items={playersPage.features.map((item, index) => ({
              ...item,
              icon: (["userRound", "video", "shield", "messageSquare", "calendar", "briefcase"] as const)[index],
            }))}
          />
        </div>
      </section>
      <section className="bg-white">
        <div className="cp-section">
          <SectionHeading eyebrow="Privacy" title={playersPage.privacyHeading} />
          <div className="mt-10">
            <PrivacyCompare visible={playersPage.visible} hidden={playersPage.hidden} />
          </div>
        </div>
      </section>
      <section className="bg-cp-paper">
        <div className="cp-section">
          <SectionHeading eyebrow="Membership" title={playersPage.pricingHeading} lead={playersPage.pricingLead} />
          <div className="mt-10">
            <PricingTiers tiers={playerPricingTiers} />
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="cp-section grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading eyebrow="FAQ" title={playersPage.faqHeading} />
          <FaqAccordion items={playersPage.faq} />
        </div>
      </section>
    </main>
  )
}
