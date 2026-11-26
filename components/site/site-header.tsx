"use client"

import type { Route } from "next"
import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { TransitionLink as Link } from "@/components/transitions/transition-link"
import { PillLink } from "@/components/site/marketing/pill-link"
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

  return (
    <header id="top" className="cp-shell-header">
      <a href="#content" className="site-skip">
        Skip to content
      </a>
      <div className="cp-shell-bar">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-cp-ink">
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-cp-primary text-sm text-white" aria-hidden>
              C+
            </span>
            {brandName}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 xl:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href as Route}
              className="cp-nav-link"
              data-active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={jobPlus}
            className="hidden rounded-full border border-cp-primary/20 bg-cp-primary/5 px-3 py-1 text-xs font-semibold text-cp-primary sm:inline-flex"
            rel="noopener"
            target="_blank"
          >
            Job+
          </a>
          <Button asChild variant="ghost" className="hidden min-h-10 rounded-full px-3 sm:inline-flex">
            <Link href={"/login" as Route}>Log in</Link>
          </Button>
          <PillLink href="/register" variant="primary" className="hidden min-h-10 px-4 text-xs sm:inline-flex">
            Register Interest
          </PillLink>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="xl:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,20rem)]">
              <SheetHeader>
                <SheetTitle className="font-display text-left">{brandName}</SheetTitle>
              </SheetHeader>
              <nav aria-label="Primary" className="flex flex-col gap-1 px-4 pb-6">
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
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-cp-primary"
                  rel="noopener"
                  target="_blank"
                  onClick={() => setOpen(false)}
                >
                  Job+
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
    </header>
  )
}
