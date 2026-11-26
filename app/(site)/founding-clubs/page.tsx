import type { Metadata } from "next"
import { SeoJsonLd } from "@/components/seo/json-ld"
import { FeatureCardGrid } from "@/components/site/marketing/feature-card-grid"
import { FoundingClubsForm } from "@/components/site/marketing/founding-clubs-form"
import { MarketingHero } from "@/components/site/marketing/marketing-hero"
import { SectionHeading } from "@/components/site/marketing/section-heading"
import { SectionReveal } from "@/components/site/marketing/section-reveal"
import { RouteReady } from "@/components/transitions/route-ready"
import { foundingClubsPage } from "@/content/pages/founding-clubs"
import { toMetadata } from "@/lib/seo/metadata"
import { fetchPageSeo } from "@/lib/seo/public"

const PATH = "/founding-clubs"

export async function generateMetadata(): Promise<Metadata> {
  return toMetadata(await fetchPageSeo(PATH))
}

export default async function FoundingClubsPage() {
  const seo = await fetchPageSeo(PATH)

  return (
    <main id="content" tabIndex={-1} className="flex flex-1 flex-col">
      <RouteReady />
      <SeoJsonLd seo={seo} />
      <MarketingHero
        eyebrow={foundingClubsPage.eyebrow}
        title={foundingClubsPage.heading}
        lead={foundingClubsPage.lead}
      />
      <section className="bg-cp-paper">
        <div className="cp-section">
          <SectionHeading eyebrow="Benefits" title={foundingClubsPage.benefitsHeading} />
          <FeatureCardGrid
            className="mt-10"
            items={foundingClubsPage.benefits.map((item, index) => ({
              ...item,
              icon: (["crown","clock3","search","users","messageCircle","shield"] as const)[index],
            }))}
          />
        </div>
      </section>
      <section className="bg-white">
        <div className="cp-section grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionReveal>
            <SectionHeading eyebrow="Apply" title={foundingClubsPage.applyHeading} />
            <ol className="mt-8 space-y-4">
              {foundingClubsPage.applySteps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm text-cp-navy/80">
                  <span className="font-display font-bold text-cp-primary">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </SectionReveal>
          <FoundingClubsForm />
        </div>
      </section>
    </main>
  )
}
