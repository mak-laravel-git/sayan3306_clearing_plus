"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SectionReveal } from "@/components/site/marketing/section-reveal"
import { cn } from "cn"

export type FaqItem = { question: string; answer: string }

export function FaqAccordion({
  items,
  className,
}: {
  items: readonly FaqItem[]
  className?: string
}) {
  return (
    <SectionReveal className={cn(className)}>
      <Accordion type="single" collapsible defaultValue="item-0" className="w-full border-y border-cp-navy/10">
        {items.map((item, index) => (
          <AccordionItem key={item.question} value={`item-${index}`} className="border-cp-navy/10 px-0">
            <AccordionTrigger className="py-5 text-base font-semibold text-cp-ink hover:no-underline md:text-lg">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-base leading-7 text-cp-navy/70">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionReveal>
  )
}
