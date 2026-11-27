/** A date the way the public pages show it ("Nov 27, 2026"), or null when there is none. */
export function formatDate(value: string | null): string | null {
  if (!value) return null
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value))
}
