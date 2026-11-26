"use client"

import { StaggerContainer, StaggerItem } from "@/components/animations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "cn"

export type StepCard = {
  step: string
  title: string
  description: string
}

export function StepCardGrid({
  items,
  className,
}: {
  items: readonly StepCard[]
  className?: string
}) {
  return (
    <StaggerContainer className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item) => (
        <StaggerItem key={item.step}>
          <Card className="h-full border-cp-navy/8 shadow-sm">
            <CardHeader>
              <p className="font-display text-sm font-bold tracking-wide text-cp-primary">{item.step}</p>
              <CardTitle className="font-display text-lg text-cp-ink">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{item.description}</CardDescription>
            </CardContent>
          </Card>
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}
