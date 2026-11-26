"use client"

import { SectionEyebrow } from "@/components/site/marketing/section-eyebrow"
import { SectionReveal } from "@/components/site/marketing/section-reveal"
import { cn } from "cn"

export function SectionHeading({
  eyebrow,
  title,
  lead,
  className,
  light,
}: {
  eyebrow?: string
  title: string
  lead?: string
  className?: string
  light?: boolean
}) {
  return (
    <SectionReveal className={cn("max-w-3xl", className)}>
      {eyebrow ? (
        <SectionEyebrow className={light ? "text-white/70" : undefined}>{eyebrow}</SectionEyebrow>
      ) : null}
      <h2
        className={cn(
          "font-display mt-3 text-3xl font-semibold tracking-tight md:text-4xl",
          light ? "text-white" : "text-cp-ink",
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p className={cn("mt-3 text-base leading-7", light ? "text-white/75" : "text-cp-navy/70")}>{lead}</p>
      ) : null}
    </SectionReveal>
  )
}
