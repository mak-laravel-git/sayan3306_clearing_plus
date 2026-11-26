"use client"

import Image from "next/image"
import type { ReactNode } from "react"

import { FadeIn, ScaleIn, SlideUp } from "@/components/animations"
import { SectionEyebrow } from "@/components/site/marketing/section-eyebrow"
import { cn } from "cn"

export function MarketingHero({
  eyebrow,
  title,
  lead,
  actions,
  imageSrc,
  imageAlt = "",
  priority,
  solid,
  children,
  className,
}: {
  eyebrow?: string
  title: string
  lead?: string
  actions?: ReactNode
  imageSrc?: string
  imageAlt?: string
  priority?: boolean
  solid?: boolean
  children?: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden text-white",
        solid ? "bg-cp-navy" : "bg-cp-ink",
        className,
      )}
    >
      {!solid && imageSrc ? (
        <Image src={imageSrc} alt={imageAlt} fill priority={priority} className="object-cover" sizes="100vw" />
      ) : null}
      <div
        className={cn(
          "absolute inset-0",
          solid ? "bg-cp-navy" : "bg-gradient-to-br from-cp-ink/95 via-cp-navy/85 to-cp-ink/70",
        )}
        aria-hidden
      />
      {!solid && !imageSrc ? (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 20%, color-mix(in srgb, #3222C2 35%, transparent), transparent 50%), radial-gradient(ellipse at 80% 70%, color-mix(in srgb, #457B9C 30%, transparent), transparent 45%)",
          }}
          aria-hidden
        />
      ) : null}
      <div className="cp-section relative z-10 grid gap-10 py-20 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:items-center md:py-28">
        <SlideUp className="max-w-2xl">
          {eyebrow ? <SectionEyebrow className="text-white/80">{eyebrow}</SectionEyebrow> : null}
          <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-balance md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {lead ? (
            <FadeIn delay={0.08}>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/80">{lead}</p>
            </FadeIn>
          ) : null}
          {actions ? (
            <FadeIn delay={0.14}>
              <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
            </FadeIn>
          ) : null}
        </SlideUp>
        {children ? <ScaleIn delay={0.12}>{children}</ScaleIn> : null}
      </div>
    </section>
  )
}
