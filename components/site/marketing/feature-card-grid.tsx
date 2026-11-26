"use client"

import {
  AlertTriangle,
  BadgeCheck,
  Briefcase,
  Calendar,
  ClipboardList,
  Clock3,
  Crown,
  EyeOff,
  FileLock2,
  Film,
  HeartHandshake,
  Lock,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Scale,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  Video,
  Waypoints,
  Workflow,
  type LucideIcon,
} from "lucide-react"

import { StaggerContainer, StaggerItem } from "@/components/animations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "cn"

const featureIcons = {
  alertTriangle: AlertTriangle,
  badgeCheck: BadgeCheck,
  briefcase: Briefcase,
  calendar: Calendar,
  clipboardList: ClipboardList,
  clock3: Clock3,
  crown: Crown,
  eyeOff: EyeOff,
  fileLock2: FileLock2,
  film: Film,
  heartHandshake: HeartHandshake,
  lock: Lock,
  messageCircle: MessageCircle,
  messageSquare: MessageSquare,
  messagesSquare: MessagesSquare,
  scale: Scale,
  search: Search,
  shield: Shield,
  shieldCheck: ShieldCheck,
  userCheck: UserCheck,
  userRound: UserRound,
  users: Users,
  video: Video,
  waypoints: Waypoints,
  workflow: Workflow,
} as const satisfies Record<string, LucideIcon>

export type FeatureIconName = keyof typeof featureIcons

export type FeatureCard = {
  title: string
  description: string
  icon?: FeatureIconName
}

export function FeatureCardGrid({
  items,
  columns = 3,
  tone = "light",
  className,
}: {
  items: readonly FeatureCard[]
  columns?: 2 | 3
  tone?: "light" | "dark"
  className?: string
}) {
  return (
    <StaggerContainer
      className={cn(
        "grid gap-4 sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon ? featureIcons[item.icon] : null
        return (
          <StaggerItem key={item.title}>
            <Card
              className={cn(
                "h-full border-cp-navy/8 shadow-sm",
                tone === "dark" && "border-white/10 bg-white/5 text-white",
              )}
            >
              <CardHeader>
                {Icon ? (
                  <span
                    className={cn(
                      "mb-1 inline-flex size-10 items-center justify-center rounded-full",
                      tone === "light" ? "bg-cp-primary/10 text-cp-primary" : "bg-cp-primary text-white",
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                ) : null}
                <CardTitle className={cn("font-display text-lg", tone === "dark" && "text-white")}>
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className={cn(tone === "dark" && "text-white/70")}>
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          </StaggerItem>
        )
      })}
    </StaggerContainer>
  )
}
