"use client"

import { FadeIn, ScaleIn, SlideIn, SlideUp } from "@/components/animations"
import { cn } from "cn"

type RevealKind = "up" | "fade" | "scale" | "left" | "right"

const map = {
  up: SlideUp,
  fade: FadeIn,
  scale: ScaleIn,
  left: SlideIn,
  right: SlideIn,
} as const

export function SectionReveal({
  children,
  className,
  kind = "up",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  kind?: RevealKind
  delay?: number
}) {
  if (kind === "left") {
    return (
      <SlideIn direction="left" className={cn(className)} delay={delay}>
        {children}
      </SlideIn>
    )
  }
  if (kind === "right") {
    return (
      <SlideIn direction="right" className={cn(className)} delay={delay}>
        {children}
      </SlideIn>
    )
  }
  const Comp = map[kind]
  return (
    <Comp className={cn(className)} delay={delay}>
      {children}
    </Comp>
  )
}
