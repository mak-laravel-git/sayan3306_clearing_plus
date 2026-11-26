/**
 * Clearing+ public marketing profile and navigation.
 * Audience and legal copy live in content/pages/*; pricing in content/pricing.ts.
 */
export type SiteProfile = {
  label: string
  href: string
}

export type NavItem = {
  href: string
  label: string
}

export const site = {
  name: "Clearing+",
  role: "Football recruitment clearing for released academy players" as string | undefined,
  tagline: "Global Youth Talent, Verified",
  summary:
    "A welfare-first football recruitment platform helping released academy players aged 16+ find their next chapter — with verified clubs, guardian safeguards, and a human placement manager on every claim." as
    | string
    | undefined,
  location: "United Kingdom" as string | undefined,
  availability: "Register interest to join the founding cohort.",
  about: [
    "Clearing+ exists for the moment football says “not this time.” We give released academy players a controlled path to verified clubs — without exposing private contact details or documents.",
    "Job+ is our related career pathway for non-football work in the UK. Players opt in from Clearing+; employers operate on Job+.",
  ] as readonly string[],
  skills: [] as readonly string[],
  email: "hello@clearingplus.maktechlaravel.cloud" as string | undefined,
  profiles: [] as readonly SiteProfile[],
  resumeHref: undefined as string | undefined,
}

export function siteDescription() {
  return site.summary ?? site.role ?? site.name
}

export const primaryNav: readonly NavItem[] = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/players", label: "Players" },
  { href: "/parents", label: "Parents" },
  { href: "/clubs", label: "Clubs" },
  { href: "/founding-clubs", label: "Founding Clubs" },
  { href: "/grassroots", label: "Grassroots" },
  { href: "/about", label: "About" },
]

export const footerPlatformNav: readonly NavItem[] = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/players", label: "Players" },
  { href: "/parents", label: "Parents" },
  { href: "/clubs", label: "Clubs" },
]

export const footerProgrammesNav: readonly NavItem[] = [
  { href: "/founding-clubs", label: "Founding Clubs" },
  { href: "/grassroots", label: "Grassroots" },
  { href: "/about", label: "About" },
]

export const legalNav: readonly NavItem[] = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
]

export function jobPlusUrl() {
  return process.env.NEXT_PUBLIC_JOB_PLUS_URL || "https://jobplus.maktechlaravel.cloud"
}

export function hasContact() {
  return Boolean(site.email || site.resumeHref || site.profiles.length > 0)
}
