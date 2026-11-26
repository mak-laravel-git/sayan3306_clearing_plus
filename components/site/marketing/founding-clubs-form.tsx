"use client"

import { FormEvent, useState } from "react"

import { SectionReveal } from "@/components/site/marketing/section-reveal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { foundingClubsPage } from "@/content/pages/founding-clubs"
import { site } from "@/content/site"

const leagueTiers = [
  "Premier League",
  "Championship",
  "League One",
  "League Two",
  "National League",
  "Academy / Other",
]

const roles = ["Club Admin", "Head of Recruitment", "Scout", "Academy Manager", "Other"]

export function FoundingClubsForm() {
  const [status, setStatus] = useState<"idle" | "ready">("idle")
  const [leagueTier, setLeagueTier] = useState("")
  const [role, setRole] = useState("")

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!site.email || !leagueTier || !role) return
    const data = new FormData(event.currentTarget)
    const lines = [
      "Founding Clubs application",
      "",
      `Club name: ${String(data.get("clubName") || "")}`,
      `Country: ${String(data.get("country") || "")}`,
      `League tier: ${leagueTier}`,
      `Contact name: ${String(data.get("contactName") || "")}`,
      `Role: ${role}`,
      `Work email: ${String(data.get("workEmail") || "")}`,
      "",
      String(data.get("message") || ""),
    ]
    const subject = encodeURIComponent("Founding Clubs application")
    const body = encodeURIComponent(lines.join("\n"))
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`
    setStatus("ready")
  }

  return (
    <SectionReveal>
      <Card className="border-cp-navy/10 shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl">Application</CardTitle>
          <CardDescription>{foundingClubsPage.formNote}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clubName">Club name *</Label>
              <Input id="clubName" name="clubName" required className="min-h-11" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input id="country" name="country" required className="min-h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leagueTier">League tier *</Label>
                <Select value={leagueTier || undefined} onValueChange={setLeagueTier}>
                  <SelectTrigger id="leagueTier" className="min-h-11 w-full">
                    <SelectValue placeholder="Select league tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {leagueTiers.map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        {tier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact name *</Label>
                <Input id="contactName" name="contactName" required className="min-h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={role || undefined} onValueChange={setRole}>
                  <SelectTrigger id="role" className="min-h-11 w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workEmail">Work email *</Label>
              <Input id="workEmail" name="workEmail" type="email" required className="min-h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">How will you use Clearing+? *</Label>
              <Textarea id="message" name="message" required rows={5} className="min-h-28" />
            </div>
            <Button type="submit" className="min-h-11 w-full rounded-full bg-cp-primary sm:w-auto">
              Submit application
            </Button>
            {status === "ready" ? (
              <p className="text-sm text-cp-navy/70" role="status">
                Opening your email client…
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </SectionReveal>
  )
}
