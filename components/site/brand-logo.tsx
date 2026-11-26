"use client"

import Image from "next/image"
import { m, useReducedMotion } from "motion/react"

import { TransitionLink as Link } from "@/components/transitions/transition-link"
import { cn } from "cn"

const TAGLINE = "Global Youth Talent, Verified"

export function BrandLogo({
  className,
  showTagline = true,
  priority,
}: {
  className?: string
  showTagline?: boolean
  priority?: boolean
}) {
  const reduce = useReducedMotion()

  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-cp-primary/40 rounded-lg", className)}
      aria-label="Clearing+ home"
    >
      <m.span
        className="relative inline-flex size-11 shrink-0 overflow-hidden rounded-full bg-white shadow-[0_4px_16px_rgba(50,34,194,0.18)] ring-1 ring-cp-navy/10 sm:size-12"
        whileHover={reduce ? undefined : { scale: 1.04, rotate: -2 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
      >
        <Image
          src="/brand/clearing-plus-logo.png"
          alt=""
          width={160}
          height={80}
          priority={priority}
          className="absolute inset-0 h-[135%] w-[220%] max-w-none -translate-x-[6%] -translate-y-[12%] object-cover object-left"
        />
        {!reduce ? (
          <m.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(50,34,194,0.22),transparent_55%)]"
            animate={{ opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}
      </m.span>

      <span className="flex min-w-0 flex-col leading-none">
        <span className="font-display text-[1.05rem] font-bold tracking-tight text-cp-navy sm:text-lg">
          Clearing<span className="text-cp-primary">+</span>
        </span>
        {showTagline ? (
          <span className="mt-1 truncate text-[0.65rem] font-medium tracking-[0.01em] text-cp-steel sm:text-[0.7rem]">
            {TAGLINE}
          </span>
        ) : null}
      </span>
    </Link>
  )
}
