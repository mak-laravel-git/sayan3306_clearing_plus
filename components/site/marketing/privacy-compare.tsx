"use client"

import { Check, X } from "lucide-react"

import { SectionReveal } from "@/components/site/marketing/section-reveal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function PrivacyCompare({
  visible,
  hidden,
}: {
  visible: { title: string; items: readonly string[] }
  hidden: { title: string; items: readonly string[] }
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionReveal kind="left">
        <Card className="border-0 bg-cp-primary text-white shadow-none">
          <CardHeader>
            <CardTitle className="font-display text-xl text-white">{visible.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {visible.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-white/90">
                  <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </SectionReveal>
      <SectionReveal kind="right" delay={0.08}>
        <Card className="border-0 bg-cp-navy text-white shadow-none">
          <CardHeader>
            <CardTitle className="font-display text-xl text-white">{hidden.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {hidden.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-white/90">
                  <X className="mt-0.5 size-4 shrink-0 text-red-300" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </SectionReveal>
    </div>
  )
}
