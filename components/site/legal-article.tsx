import { SeoJsonLd } from "@/components/seo/json-ld"
import { formatDate } from "@/components/site/content-cards"
import { SectionEyebrow } from "@/components/site/marketing/section-eyebrow"
import { RouteReady } from "@/components/transitions/route-ready"
import type { LegalPage } from "@/content/pages/legal"
import { site } from "@/content/site"
import type { ResolvedSeo } from "@/lib/seo/types"

function sectionId(heading: string) {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function LegalArticle({ page, path, seo }: { page: LegalPage; path: string; seo: ResolvedSeo }) {
  return (
    <main id="content" tabIndex={-1} className="flex flex-1 flex-col">
      <RouteReady />
      <SeoJsonLd seo={seo} />

      <section className="bg-cp-navy text-white">
        <div className="cp-section py-16 md:py-20">
          <SectionEyebrow className="text-white/70">Legal</SectionEyebrow>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{page.heading}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">{page.intro}</p>
          <p className="mt-4 text-sm text-white/60">
            Last updated <time dateTime={page.updated}>{formatDate(page.updated)}</time>
            <span className="sr-only"> Path {path}</span>
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="cp-section grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl bg-cp-paper p-5 lg:sticky lg:top-24">
            <p className="text-xs font-semibold tracking-[0.16em] text-cp-navy/50 uppercase">Contents</p>
            <nav aria-label="On this page" className="mt-4">
              <ol className="space-y-2">
                {page.sections.map((section, index) => (
                  <li key={section.heading}>
                    <a
                      href={`#${sectionId(section.heading)}`}
                      className="text-sm text-cp-navy/80 hover:text-cp-primary"
                    >
                      {index + 1}. {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="space-y-10">
            {page.sections.map((section, index) => (
              <section key={section.heading} id={sectionId(section.heading)} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold text-cp-ink">
                  {index + 1}. {section.heading}
                </h2>
                <div className="mt-4 space-y-4 text-base leading-7 text-cp-navy/75">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.items?.map((item) => (
                    <div key={item.title}>
                      <h3 className="font-display text-lg font-semibold text-cp-ink">{item.title}</h3>
                      <p className="mt-2">{item.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
            <p className="border-t border-cp-navy/10 pt-6 text-sm text-cp-navy/70">
              Questions about this page?{" "}
              {site.email ? (
                <a href={`mailto:${site.email}`} className="font-medium text-cp-primary underline-offset-4 hover:underline">
                  Email us
                </a>
              ) : (
                "Contact the platform team."
              )}
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}
