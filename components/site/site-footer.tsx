import type { Route } from "next"

import { NewsletterJoin } from "@/components/site/marketing/newsletter-join"
import { TransitionLink as Link } from "@/components/transitions/transition-link"
import {
  footerPlatformNav,
  footerProgrammesNav,
  legalNav,
  site,
} from "@/content/site"

export function SiteFooter({ brandName = "Clearing+" }: { brandName?: string }) {
  const year = new Date().getFullYear()

  return (
    <footer className="cp-footer mt-16">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 md:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-lg font-semibold">
            Clearing<span className="text-cp-primary">+</span>
          </p>
          <p className="mt-1 text-xs font-medium tracking-wide text-cp-steel">{site.tagline}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">{site.summary}</p>
          <NewsletterJoin />
        </div>
        <nav aria-label="Platform">
          <p className="text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">Platform</p>
          <ul className="mt-3 space-y-2">
            {footerPlatformNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href as Route} className="text-sm text-white/80 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Programmes">
          <p className="text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">Programmes</p>
          <ul className="mt-3 space-y-2">
            {footerProgrammesNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href as Route} className="text-sm text-white/80 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Company">
          <p className="text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">Company</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href={"/about" as Route} className="text-sm text-white/80 hover:text-white">
                About
              </Link>
            </li>
            {site.email ? (
              <li>
                <a href={`mailto:${site.email}`} className="text-sm text-white/80 hover:text-white">
                  Contact
                </a>
              </li>
            ) : null}
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href as Route} className="text-sm text-white/80 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 border-t border-white/10 px-4 py-5 text-xs text-white/50 md:flex-row md:items-center md:justify-between md:px-6">
        <p>
          © {year} {brandName}. All rights reserved.
        </p>
        <div className="flex gap-4">
          {legalNav.map((item) => (
            <Link key={item.href} href={item.href as Route} className="hover:text-white">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
