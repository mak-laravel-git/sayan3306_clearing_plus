import type { Metadata } from "next"
import { SeoJsonLd } from "@/components/seo/json-ld"
import { FaqAccordion } from "@/components/site/marketing/faq-accordion"
import { FeatureCardGrid } from "@/components/site/marketing/feature-card-grid"
import { MarketingHero } from "@/components/site/marketing/marketing-hero"
import { PillLink } from "@/components/site/marketing/pill-link"
import { SectionHeading } from "@/components/site/marketing/section-heading"
import { SectionReveal } from "@/components/site/marketing/section-reveal"
import { StepCardGrid } from "@/components/site/marketing/step-card-grid"
import { RouteReady } from "@/components/transitions/route-ready"
import { TransitionLink as Link } from "@/components/transitions/transition-link"
import { homePage } from "@/content/pages/home"
import { toMetadata } from "@/lib/seo/metadata"
import { fetchPageSeo } from "@/lib/seo/public"

export async function generateMetadata(): Promise<Metadata> {
  return toMetadata(await fetchPageSeo("/"))
}

export default async function Home() {
  const seo = await fetchPageSeo("/")

  return (
    <main id="content" tabIndex={-1} className="flex flex-1 flex-col">
      <RouteReady />
      <SeoJsonLd seo={seo} />

      <MarketingHero
        title={homePage.heading}
        lead={homePage.lead}
        priority
        actions={homePage.heroCtas.map((cta) => (
          <PillLink key={cta.href} href={cta.href} variant={cta.variant}>
            {cta.label}
          </PillLink>
        ))}
      >
        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
          <p className="text-xs font-semibold tracking-[0.16em] text-white/60 uppercase">Profile preview</p>
          <div className="mt-4 aspect-video rounded-2xl bg-gradient-to-br from-cp-primary/40 to-cp-steel/30" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-2/3 rounded-full bg-white/30" />
            <div className="h-3 w-1/2 rounded-full bg-white/20" />
          </div>
          <p className="mt-4 text-sm text-white/70">Verified · Consent gated · PPM mediated</p>
        </div>
      </MarketingHero>

      <section className="bg-cp-paper">
        <div className="cp-section">
          <SectionHeading eyebrow="Step by step" title={homePage.stepsHeading} lead={homePage.stepsIntro} />
          <StepCardGrid items={homePage.steps} className="mt-10 lg:grid-cols-4" />
        </div>
      </section>

      <section className="bg-cp-navy text-white">
        <div className="cp-section grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <SectionHeading
            light
            eyebrow={homePage.claimStrip.eyebrow}
            title={homePage.claimStrip.heading}
            lead={homePage.claimStrip.lead}
          />
          <SectionReveal kind="right">
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6">
              <p className="text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">Claim submitted</p>
              <p className="mt-3 font-display text-xl font-semibold">Awaiting PPM review</p>
              <p className="mt-2 text-sm text-white/65">Club interest is logged. Player contacts stay private.</p>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className="bg-white">
        <div className="cp-section flex flex-col gap-16">
          {homePage.audiences.map((audience, index) => (
            <div
              key={audience.href}
              className={`grid gap-8 md:grid-cols-2 md:items-center ${index % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
            >
              <SectionReveal kind={index % 2 === 0 ? "left" : "right"}>
                <div
                  className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-cp-navy via-cp-primary/60 to-cp-steel"
                  aria-hidden
                />
              </SectionReveal>
              <SectionReveal kind={index % 2 === 0 ? "right" : "left"} delay={0.08}>
                <div>
                  <SectionHeading eyebrow={audience.eyebrow} title={audience.title} lead={audience.body} />
                  <PillLink href={audience.href} variant="primary" className="mt-6">
                    {audience.cta}
                  </PillLink>
                </div>
              </SectionReveal>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cp-paper">
        <div className="cp-section grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow={homePage.humanMiddle.eyebrow}
              title={homePage.humanMiddle.heading}
              lead={homePage.humanMiddle.lead}
            />
            <FeatureCardGrid className="mt-8" columns={2} items={homePage.humanMiddle.points} />
          </div>
          <SectionReveal kind="right">
            <div className="rounded-3xl border border-cp-navy/10 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold tracking-[0.16em] text-cp-primary uppercase">PPM thread</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-cp-paper p-4 text-sm text-cp-navy/80">
                  Club submitted a Claim on your profile.
                </div>
                <div className="ml-8 rounded-2xl bg-cp-primary/10 p-4 text-sm text-cp-ink">
                  PPM: We will discuss options with you and your guardian.
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className="bg-cp-ink text-white">
        <div className="cp-section">
          <SectionHeading light eyebrow={homePage.safety.eyebrow} title={homePage.safety.heading} />
          <FeatureCardGrid
            className="mt-10"
            tone="dark"
            items={homePage.safety.items.map((item, index) => ({
              ...item,
              icon: (["shield","userRound","video","messageSquare","calendar","briefcase"] as const)[index % 6],
            }))}
          />
        </div>
      </section>

      <SectionReveal>
        <section className="bg-cp-primary text-white">
          <div className="cp-section flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{homePage.beta.title}</h2>
              <p className="mt-3 text-base leading-7 text-white/80">{homePage.beta.lead}</p>
            </div>
            <PillLink href="/register" variant="light">
              Register Interest
            </PillLink>
          </div>
        </section>
      </SectionReveal>

      <section className="bg-cp-steel text-white">
        <div className="cp-section grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
          <SectionReveal kind="scale">
            <p className="font-display text-7xl font-semibold md:text-8xl">5%</p>
          </SectionReveal>
          <div>
            <SectionHeading
              light
              eyebrow={homePage.impact.eyebrow}
              title={homePage.impact.heading}
              lead={homePage.impact.lead}
            />
            <Link href="/grassroots" className="mt-6 inline-flex text-sm font-semibold underline-offset-4 hover:underline">
              Learn about Grassroots
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-cp-paper">
        <div className="cp-section">
          <SectionReveal>
            <div className="rounded-3xl bg-cp-navy p-8 text-white md:p-12">
              <p className="font-display text-2xl font-semibold text-balance md:text-3xl">
                &ldquo;{homePage.testimonial.quote}&rdquo;
              </p>
              <p className="mt-4 text-sm text-white/70">{homePage.testimonial.attribution}</p>
            </div>
          </SectionReveal>
        </div>
      </section>

      <section className="bg-white">
        <div className="cp-section grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading eyebrow="FAQ" title={homePage.faqHeading} />
          <FaqAccordion items={homePage.faq} />
        </div>
      </section>

      <MarketingHero
        className="mt-0"
        title={homePage.finalCta.title}
        lead={homePage.finalCta.lead}
        actions={
          <>
            <PillLink href="/register" variant="light">
              Register Interest
            </PillLink>
            <PillLink href="/how-it-works" variant="outline">
              How it works
            </PillLink>
          </>
        }
      />
    </main>
  )
}
