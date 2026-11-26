"use client"

import type { Route } from "next"
import type { ReactNode } from "react"

import { TransitionLink as Link } from "@/components/transitions/transition-link"
import { Button } from "@/components/ui/button"
import { cn } from "cn"

type Variant = "primary" | "light" | "outline" | "ghost"

const variants: Record<Variant, string> = {
  primary: "bg-cp-primary text-white shadow-[0_0_24px_color-mix(in_srgb,#3222C2_35%,transparent)] hover:bg-cp-primary/90",
  light: "bg-white text-cp-navy hover:bg-white/90",
  outline: "border border-white/70 bg-transparent text-white hover:bg-white/10",
  ghost: "border border-cp-navy/20 bg-transparent text-cp-navy hover:bg-cp-navy/5",
}

export function PillLink({
  href,
  children,
  variant = "primary",
  className,
  external,
}: {
  href: string
  children: ReactNode
  variant?: Variant
  className?: string
  external?: boolean
}) {
  const classes = cn("min-h-11 rounded-full px-5 text-sm font-semibold", variants[variant], className)
  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <Button asChild className={classes}>
        <a href={href} {...(href.startsWith("http") ? { rel: "noopener", target: "_blank" } : {})}>
          {children}
        </a>
      </Button>
    )
  }
  return (
    <Button asChild className={classes}>
      <Link href={href as Route}>{children}</Link>
    </Button>
  )
}
