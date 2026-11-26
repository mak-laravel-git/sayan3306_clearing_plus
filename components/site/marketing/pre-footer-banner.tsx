"use client"

import type { ReactNode } from "react"

import { SectionReveal } from "@/components/site/marketing/section-reveal"
import { cn } from "cn"

export function PreFooterBanner({
  title,
  lead,
  actions,
  tone = "navy",
  className,
}: {
  title: string
  lead?: string
  actions?: ReactNode
  tone?: "navy" | "primary" | "steel"
  className?: string
}) {
  const tones = {
    navy: "bg-cp-navy text-white",
    primary: "bg-cp-primary text-white",
    steel: "bg-cp-steel text-white",
  }

  return (
    <section className={cn("px-4 md:px-6", className)}>
      <SectionReveal>
        <div className={cn("mx-auto max-w-7xl rounded-3xl px-6 py-12 md:px-12 md:py-16", tones[tone])}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-balance md:text-4xl">{title}</h2>
              {lead ? <p className="mt-3 text-base leading-7 text-white/80 md:text-lg">{lead}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>
        </div>
      </SectionReveal>
    </section>
  )
}
