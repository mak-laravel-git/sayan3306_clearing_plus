import type { Metadata } from "next"
import { CheckCircle2 } from "lucide-react"

import { SeoJsonLd } from "@/components/seo/json-ld"
import { StaggerContainer, StaggerItem } from "@/components/animations"
import { MarketingHero } from "@/components/site/marketing/marketing-hero"
import { PillLink } from "@/components/site/marketing/pill-link"
import { PreFooterBanner } from "@/components/site/marketing/pre-footer-banner"
import { PricingTiers } from "@/components/site/marketing/pricing-tiers"
import { SectionHeading } from "@/components/site/marketing/section-heading"
import { StepCardGrid } from "@/components/site/marketing/step-card-grid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RouteReady } from "@/components/transitions/route-ready"
import { howItWorksPage } from "@/content/pages/how-it-works"
import { playerPricingTiers } from "@/content/pricing"
import { toMetadata } from "@/lib/seo/metadata"
import { fetchPageSeo } from "@/lib/seo/public"

const PATH = "/how-it-works"

export async function generateMetadata(): Promise<Metadata> {
  return toMetadata(await fetchPageSeo(PATH))
}

export default async function HowItWorksPage() {
  const seo = await fetchPageSeo(PATH)

  return (
    <main id="content" tabIndex={-1} className="flex flex-1 flex-col">
      <RouteReady />
      <SeoJsonLd seo={seo} />
      <MarketingHero
        eyebrow={howItWorksPage.eyebrow}
        title={howItWorksPage.heading}
        lead={howItWorksPage.lead}
        actions={
          <>
            <PillLink href="/register" variant="light">
              Register as a Player
            </PillLink>
            <PillLink href="/clubs" variant="outline">
              Register a Club
            </PillLink>
          </>
        }
      />
      <section className="bg-cp-paper">
        <div className="cp-section">
          <SectionHeading eyebrow="Step by step" title={howItWorksPage.playerJourneyHeading} />
          <StepCardGrid className="mt-10" items={howItWorksPage.playerJourney} />
        </div>
      </section>
      <section className="bg-white">
        <div className="cp-section">
          <SectionHeading eyebrow="Claims" title={howItWorksPage.claimHeading} />
          <StaggerContainer className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {howItWorksPage.claimSteps.map((step, index) => (
              <StaggerItem key={step.title}>
                <Card className="h-full border-cp-navy/10">
                  <CardHeader>
                    <CheckCircle2 className="size-5 text-cp-primary" aria-hidden />
                    <p className="text-xs font-semibold tracking-[0.14em] text-cp-primary uppercase">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <CardTitle className="font-display text-base">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-cp-navy/70">{step.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
      <section className="bg-cp-paper">
        <div className="cp-section">
          <SectionHeading eyebrow="Pricing" title={howItWorksPage.pricingHeading} lead={howItWorksPage.pricingLead} />
          <div className="mt-10">
            <PricingTiers tiers={playerPricingTiers} />
          </div>
        </div>
      </section>
      <PreFooterBanner
        className="my-10"
        title={howItWorksPage.cta.title}
        lead={howItWorksPage.cta.lead}
        actions={<PillLink href="/register" variant="light">Register Interest</PillLink>}
      />
    </main>
  )
}
