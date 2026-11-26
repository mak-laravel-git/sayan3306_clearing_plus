"use client"

import type { Route } from "next"
import { ArrowUpRight, Menu } from "lucide-react"
import { m, useReducedMotion } from "motion/react"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { BrandLogo } from "@/components/site/brand-logo"
import { PillLink } from "@/components/site/marketing/pill-link"
import { TransitionLink as Link } from "@/components/transitions/transition-link"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { jobPlusUrl, primaryNav } from "@/content/site"
import { cn } from "cn"

export function SiteHeader({ brandName = "Clearing+" }: { brandName?: string }) {
  const pathname = usePathname()
  const jobPlus = jobPlusUrl()
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()

  return (
    <m.header
      id="top"
      className="cp-shell-header"
      initial={reduce ? false : { y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <a href="#content" className="site-skip">
        Skip to content
      </a>
      <div className="cp-shell-bar gap-3 lg:gap-6">
        <BrandLogo priority />

        <nav aria-label="Primary" className="hidden items-center gap-0.5 xl:flex">
          {primaryNav.map((item, index) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <m.div
                key={item.href}
                initial={reduce ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + index * 0.03, duration: 0.35 }}
              >
                <Link
                  href={item.href as Route}
                  className={cn(
                    "cp-nav-link group relative px-2.5 text-[0.8125rem] font-medium tracking-tight",
                    active && "text-cp-primary",
                  )}
                  data-active={active}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-2.5 -bottom-0.5 h-0.5 origin-left rounded-full bg-cp-primary transition-transform duration-300",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </Link>
              </m.div>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
          <m.a
            href={jobPlus}
            className="hidden items-center gap-1 rounded-full border border-cp-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-cp-navy shadow-sm transition-colors hover:border-cp-primary/40 hover:text-cp-primary lg:inline-flex"
            rel="noopener"
            target="_blank"
            whileHover={reduce ? undefined : { y: -1 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
          >
            Job+
            <ArrowUpRight className="size-3.5 opacity-70" aria-hidden />
          </m.a>

          <Button
            asChild
            variant="ghost"
            className="hidden min-h-10 rounded-full px-3 text-sm font-medium text-cp-navy hover:bg-cp-paper hover:text-cp-primary sm:inline-flex"
          >
            <Link href={"/login" as Route}>Log in</Link>
          </Button>

          <m.div
            className="hidden sm:block"
            whileHover={reduce ? undefined : { scale: 1.02 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            <PillLink
              href="/register"
              variant="primary"
              className="min-h-10 px-4 text-xs shadow-[0_8px_28px_rgba(50,34,194,0.45)]"
            >
              Register Interest
            </PillLink>
          </m.div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="border-cp-navy/15 xl:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,20rem)]">
              <SheetHeader>
                <SheetTitle className="sr-only">{brandName} menu</SheetTitle>
                <BrandLogo showTagline={false} />
              </SheetHeader>
              <nav aria-label="Primary" className="mt-2 flex flex-col gap-1 px-4 pb-6">
                {primaryNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href as Route}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium text-cp-navy hover:bg-cp-paper",
                      pathname === item.href && "bg-cp-primary/10 text-cp-primary",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <a
                  href={jobPlus}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium text-cp-primary"
                  rel="noopener"
                  target="_blank"
                  onClick={() => setOpen(false)}
                >
                  Job+
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </a>
                <Link
                  href={"/login" as Route}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-cp-navy"
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Link>
                <div className="pt-3" onClick={() => setOpen(false)}>
                  <PillLink href="/register" variant="primary" className="w-full text-xs">
                    Register Interest
                  </PillLink>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </m.header>
  )
}
