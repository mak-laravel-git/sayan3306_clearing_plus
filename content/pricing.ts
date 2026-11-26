export type PricingTier = {
  id: string
  name: string
  price: string
  period: string
  description: string
  features: readonly string[]
  featured?: boolean
  badge?: string
  ctaLabel: string
  ctaHref: string
}

/** Shared player membership tiers — How It Works + Players. */
export const playerPricingTiers: readonly PricingTier[] = [
  {
    id: "founding-academy",
    name: "Founding / Member Academy",
    price: "£24.99",
    period: "/ year",
    description: "Lowest fee for players from founding or member academies.",
    features: [
      "Verified football profile",
      "Moderated highlight videos",
      "Dedicated placement support",
      "Job+ career opt-in",
    ],
    featured: true,
    badge: "Lowest fee",
    ctaLabel: "Register Interest",
    ctaHref: "/register",
  },
  {
    id: "uk-other",
    name: "Other UK players",
    price: "£49.99",
    period: "/ year",
    description: "Standard annual membership for eligible UK players.",
    features: [
      "Verified football profile",
      "Moderated highlight videos",
      "Dedicated placement support",
      "Job+ career opt-in",
    ],
    ctaLabel: "Register Interest",
    ctaHref: "/register",
  },
  {
    id: "international",
    name: "International players",
    price: "£29.99",
    period: "/ year",
    description: "Annual membership for eligible international players under GBP V1 rules.",
    features: [
      "Verified football profile",
      "Moderated highlight videos",
      "Dedicated placement support",
      "Job+ career opt-in",
    ],
    ctaLabel: "Register Interest",
    ctaHref: "/register",
  },
]

export type ClubFeeRow = {
  contractBand: string
  valueLabel: string
  fee: string
}

/** Illustrative club placement fee table from the Clubs mock. */
export const clubFeeRows: readonly ClubFeeRow[] = [
  { contractBand: "First-year contract under £50k", valueLabel: "10% of first-year base", fee: "From £2,500" },
  { contractBand: "£50k – £100k", valueLabel: "10% of first-year base", fee: "£5,000 – £10,000" },
  { contractBand: "Over £100k", valueLabel: "10% of first-year base", fee: "Custom quote" },
]

export const clubFeeCalculatorDefaults = {
  salaryLabel: "Illustrative first-year base salary",
  salaryExample: 60000,
  rate: 0.1,
  note: "Placement fee is calculated as 10% of first-year base salary. Final fees are confirmed in writing before a Claim completes.",
}
