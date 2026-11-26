import type { Metadata } from "next"
import { StaggerContainer, StaggerItem } from "@/components/animations"
import { SeoJsonLd } from "@/components/seo/json-ld"
import { FeatureCardGrid } from "@/components/site/marketing/feature-card-grid"
import { MarketingHero } from "@/components/site/marketing/marketing-hero"
import { PillLink } from "@/components/site/marketing/pill-link"
import { PreFooterBanner } from "@/components/site/marketing/pre-footer-banner"
import { SectionHeading } from "@/components/site/marketing/section-heading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RouteReady } from "@/components/transitions/route-ready"
import { aboutPage } from "@/content/pages/about"
import { toMetadata } from "@/lib/seo/metadata"
import { fetchPageSeo } from "@/lib/seo/public"

const PATH = "/about"

export async function generateMetadata(): Promise<Metadata> {
  return toMetadata(await fetchPageSeo(PATH))
}

export default async function AboutPage() {
  const seo = await fetchPageSeo(PATH)

  return (
    <main id="content" tabIndex={-1} className="flex flex-1 flex-col">
      <RouteReady />
      <SeoJsonLd seo={seo} />
      <MarketingHero eyebrow={aboutPage.eyebrow} title={aboutPage.heading} lead={aboutPage.lead} />
      <section className="bg-cp-paper">
        <div className="cp-section grid gap-8 md:grid-cols-2">
          <SectionHeading eyebrow="Mission" title={aboutPage.missionHeading} />
          <div className="space-y-4 text-base leading-7 text-cp-navy/75">
            {aboutPage.mission.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="cp-section">
          <SectionHeading eyebrow="Values" title={aboutPage.valuesHeading} />
          <FeatureCardGrid
            className="mt-10"
            items={aboutPage.values.map((item, index) => ({
              ...item,
              icon: (["shield","lock","users","heartHandshake","scale","waypoints"] as const)[index],
            }))}
          />
        </div>
      </section>
      <section className="bg-cp-paper">
        <div className="cp-section">
          <SectionHeading eyebrow="Team" title={aboutPage.teamHeading} />
          <StaggerContainer className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {aboutPage.team.map((member) => (
              <StaggerItem key={member.title}>
                <Card className="h-full border-0 bg-cp-primary text-white shadow-none">
                  <CardHeader>
                    <CardTitle className="font-display text-lg text-white">{member.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-white/80">{member.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
      <PreFooterBanner
        className="my-10"
        tone="navy"
        title={aboutPage.cta.title}
        lead={aboutPage.cta.lead}
        actions={<PillLink href="/register" variant="primary">Register Interest</PillLink>}
      />
    </main>
  )
}
