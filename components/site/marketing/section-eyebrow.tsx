import { cn } from "cn"

export function SectionEyebrow({ children, className }: { children: string; className?: string }) {
  return <p className={cn("cp-eyebrow", className)}>— {children}</p>
}
