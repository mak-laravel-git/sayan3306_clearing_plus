"use client"

import { Award } from "lucide-react"
import { useEffect, useState } from "react"

import { PillLink } from "@/components/site/marketing/pill-link"

/**
 * The live count of Founding Welfare Clubs that have activated. It is fetched
 * in the browser so the public pages stay static and cached; when the count
 * cannot be read the band still offers the way in.
 */
export function FoundingCounter({ className }: { className?: string }) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch("/api/clubs/stats", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { activated?: number } | null) => {
        if (typeof body?.activated === "number") setCount(body.activated)
      })
      .catch(() => undefined)

    return () => controller.abort()
  }, [])

  return (
    <section className={className ?? "bg-cp-paper"} aria-label="Founding Welfare Clubs">
      <div className="cp-section flex flex-col items-start justify-between gap-5 py-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cp-primary/10 text-cp-primary">
            <Award className="size-6" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-cp-primary uppercase">Founding Welfare Clubs</p>
            <p className="font-display text-2xl font-semibold text-cp-navy" aria-live="polite">
              {count === null ? "Clubs are joining" : `${count.toLocaleString("en-GB")} club${count === 1 ? "" : "s"} activated`}
            </p>
          </div>
        </div>
        <PillLink href="/register/club" variant="primary">
          Activate your club
        </PillLink>
      </div>
    </section>
  )
}
