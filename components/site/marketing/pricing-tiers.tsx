"use client"

import { Check } from "lucide-react"

import { StaggerContainer, StaggerItem } from "@/components/animations"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { PricingTier } from "@/content/pricing"
import { cn } from "cn"
import type { Route } from "next"
import { TransitionLink as Link } from "@/components/transitions/transition-link"

export function PricingTiers({ tiers }: { tiers: readonly PricingTier[] }) {
  return (
    <StaggerContainer className="grid gap-4 lg:grid-cols-3">
      {tiers.map((tier) => (
        <StaggerItem key={tier.id}>
          <Card
            className={cn(
              "flex h-full flex-col border-cp-navy/10",
              tier.featured && "border-cp-primary bg-cp-primary text-white shadow-lg",
            )}
          >
            <CardHeader>
              {tier.badge ? (
                <Badge
                  variant="secondary"
                  className={cn(
                    "mb-2 w-fit",
                    tier.featured ? "bg-white/15 text-white hover:bg-white/20" : "bg-cp-primary/10 text-cp-primary",
                  )}
                >
                  {tier.badge}
                </Badge>
              ) : (
                <span className="mb-2 h-5" aria-hidden />
              )}
              <CardTitle className={cn("font-display text-xl", tier.featured && "text-white")}>{tier.name}</CardTitle>
              <CardDescription className={cn(tier.featured && "text-white/80")}>{tier.description}</CardDescription>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold">{tier.price}</span>
                <span className={cn("text-sm", tier.featured ? "text-white/70" : "text-cp-navy/60")}>{tier.period}</span>
              </p>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="flex flex-col gap-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm">
                    <Check className={cn("mt-0.5 size-4 shrink-0", tier.featured ? "text-white" : "text-cp-primary")} aria-hidden />
                    <span className={tier.featured ? "text-white/90" : "text-cp-navy/80"}>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className={cn(
                  "min-h-11 w-full rounded-full",
                  tier.featured
                    ? "bg-white text-cp-navy hover:bg-white/90"
                    : "bg-cp-primary text-white hover:bg-cp-primary/90",
                )}
              >
                <Link href={tier.ctaHref as Route}>{tier.ctaLabel}</Link>
              </Button>
            </CardFooter>
          </Card>
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}
