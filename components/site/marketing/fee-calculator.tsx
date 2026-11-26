"use client"

import { useMemo, useState } from "react"

import { SectionReveal } from "@/components/site/marketing/section-reveal"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { clubFeeCalculatorDefaults, clubFeeRows } from "@/content/pricing"

function formatGbp(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value)
}

export function FeeCalculator() {
  const [salary, setSalary] = useState(clubFeeCalculatorDefaults.salaryExample)
  const fee = useMemo(() => Math.round(salary * clubFeeCalculatorDefaults.rate), [salary])

  return (
    <SectionReveal>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-3xl bg-cp-primary p-6 text-white md:p-8">
          <h3 className="font-display text-2xl font-semibold">Placement fee calculator</h3>
          <Label htmlFor="fee-salary" className="mt-4 text-white/80">
            {clubFeeCalculatorDefaults.salaryLabel}
          </Label>
          <Slider
            id="fee-salary"
            className="mt-6 **:data-[slot=slider-track]:bg-white/25 **:data-[slot=slider-range]:bg-white **:data-[slot=slider-thumb]:border-white"
            min={20000}
            max={150000}
            step={1000}
            value={[salary]}
            onValueChange={(value) => setSalary(value[0] ?? salary)}
          />
          <p className="mt-4 font-display text-3xl font-semibold">{formatGbp(salary)}</p>
          <p className="mt-6 text-sm text-white/80">Estimated placement fee (10%)</p>
          <p className="font-display text-4xl font-semibold">{formatGbp(fee)}</p>
          <p className="mt-4 text-xs leading-5 text-white/70">{clubFeeCalculatorDefaults.note}</p>
        </div>
        <div className="overflow-hidden rounded-3xl border border-cp-navy/10 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-cp-paper hover:bg-cp-paper">
                <TableHead>First-year contract</TableHead>
                <TableHead>Value basis</TableHead>
                <TableHead>Placement fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubFeeRows.map((row) => (
                <TableRow key={row.contractBand}>
                  <TableCell className="text-cp-ink">{row.contractBand}</TableCell>
                  <TableCell className="text-cp-navy/70">{row.valueLabel}</TableCell>
                  <TableCell className="font-medium text-cp-primary">{row.fee}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </SectionReveal>
  )
}
