"use client"

import { usePathname } from "next/navigation"
import { useReportWebVitals } from "next/web-vitals"
import { useEffect, useRef } from "react"

const ENDPOINT = "/api/seo/collect"
const VITALS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"])

type VitalsByPath = Map<string, Map<string, { name: string; value: number; rating: string }>>

function send(body: Record<string, unknown>) {
  try {
    const data = JSON.stringify(body)
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([data], { type: "application/json" }))) return
    void fetch(ENDPOINT, { method: "POST", body: data, headers: { "Content-Type": "application/json" }, keepalive: true })
  } catch {
    // Monitoring must never break the page.
  }
}

/**
 * Reports a page view and the page's real-user Core Web Vitals to our own API
 * through the BFF. No cookie or storage is used, and the visitor is not
 * identified. Mounted on public pages only, and only while an admin has
 * turned monitoring on.
 */
export function TrafficReporter() {
  const pathname = usePathname()
  const previous = useRef<string | null>(null)
  const current = useRef(pathname)
  const vitals = useRef<VitalsByPath>(new Map())

  useEffect(() => {
    current.current = pathname
    // First load: the real referrer. Later client navigations: the page we came from, which counts as internal.
    const referrer = previous.current === null ? document.referrer : `${window.location.origin}${previous.current}`
    previous.current = pathname
    send({ type: "view", path: pathname, referrer })
  }, [pathname])

  useReportWebVitals((metric) => {
    if (!VITALS.has(metric.name)) return
    const path = current.current
    const byName = vitals.current.get(path) ?? new Map()
    byName.set(metric.name, { name: metric.name, value: metric.value, rating: metric.rating })
    vitals.current.set(path, byName)
  })

  useEffect(() => {
    function flush() {
      for (const [path, byName] of vitals.current) {
        if (byName.size > 0) send({ type: "vitals", path, metrics: [...byName.values()] })
      }
      vitals.current = new Map()
    }

    function onVisibility() {
      if (document.visibilityState === "hidden") flush()
    }

    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("pagehide", flush)

    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("pagehide", flush)
    }
  }, [])

  return null
}
