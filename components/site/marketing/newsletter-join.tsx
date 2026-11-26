"use client"

import { FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { site } from "@/content/site"

export function NewsletterJoin() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sent">("idle")

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || !site.email) return
    const subject = encodeURIComponent("Clearing+ updates")
    const body = encodeURIComponent(`Please add me to Clearing+ updates.\n\nEmail: ${email.trim()}`)
    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`
    setStatus("sent")
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="cp-newsletter-email" className="sr-only">
          Email for updates
        </Label>
        <Input
          id="cp-newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email for updates"
          className="min-h-11 rounded-full border-white/20 bg-white/5 text-white placeholder:text-white/50"
        />
      </div>
      <Button type="submit" className="min-h-11 rounded-full bg-cp-primary px-6">
        Join
      </Button>
      {status === "sent" ? (
        <p className="sr-only" role="status">
          Opening your email client
        </p>
      ) : null}
    </form>
  )
}
