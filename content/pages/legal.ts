/**
 * Prototype legal copy for Clearing+. Have counsel review before launch.
 */
export type LegalSection = {
  heading: string
  paragraphs: readonly string[]
  items?: readonly { title: string; body: string }[]
}

export type LegalPage = {
  heading: string
  updated: string
  intro: string
  sections: readonly LegalSection[]
}

export const privacyPolicy: LegalPage = {
  heading: "Privacy Policy",
  updated: "2026-11-25",
  intro:
    "This prototype policy describes how Clearing+ intends to handle personal information for players, guardians, clubs and visitors. Final legal wording will replace this page before public launch.",
  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        "Clearing+ is a welfare-first football recruitment platform operated for Integrity Sports (UK) Ltd contexts described in the product specification. Contact details for privacy requests will be published here before launch.",
      ],
    },
    {
      heading: "Information we collect",
      paragraphs: [
        "Depending on your role we may process account details, football profile information, guardian links, club organisation data, verification documents, Claim records, payment status and technical logs needed to secure the service.",
      ],
    },
    {
      heading: "Players aged 16–17",
      paragraphs: [
        "Under-18 players require linked guardian consent before a football profile becomes searchable. Guardians can withdraw consent, which immediately hides the searchable profile. Messages involving under-18 players are mirrored to the linked guardian as required.",
      ],
    },
    {
      heading: "What clubs and employers can see",
      paragraphs: [
        "Verified clubs see consented football information only. Phone numbers, home addresses, guardian details, identity documents and payment details are not shown to clubs. Job+ employers never receive candidate contact details before an accepted interest flow.",
      ],
    },
    {
      heading: "How we use information",
      paragraphs: [
        "We use personal data to operate Clearing+ and Job+ pathways, verify eligibility, mediate Claims, process fees, safeguard users, and keep audit evidence. We do not sell personal information for advertising profiles.",
      ],
    },
    {
      heading: "Sharing and processors",
      paragraphs: [
        "Hosting, email, payments (for example Stripe) and search providers may process data under contracts. We share information with others only where the law requires it or where a user has authorised a mediated introduction.",
      ],
    },
    {
      heading: "Retention and security",
      paragraphs: [
        "Retention periods will match safeguarding and financial obligations. Traffic is encrypted in transit, passwords are hashed, and privileged access is limited and audited.",
      ],
    },
    {
      heading: "Contact us",
      paragraphs: [
        "For privacy questions during the staging period, email the address published in the site footer. This page will be updated with a formal DPO or privacy contact before production launch.",
      ],
    },
  ],
}

export const termsOfService: LegalPage = {
  heading: "Terms of Use",
  updated: "2026-11-25",
  intro:
    "These prototype terms outline acceptable use of Clearing+ for players, guardians, clubs, employers and staff. Final counsel-approved terms will replace this page before launch.",
  sections: [
    {
      heading: "The service",
      paragraphs: [
        "Clearing+ provides controlled football recruitment workflows and related Job+ career pathways. Features may change during staging. No production SLA is offered until launch.",
      ],
    },
    {
      heading: "Accounts and roles",
      paragraphs: [
        "You must provide accurate information and keep credentials secure. Role permissions (player, guardian, club, employer, PPM, admin) limit what you can see and do. Attempting to bypass those limits is forbidden.",
      ],
    },
    {
      heading: "Player and guardian responsibilities",
      paragraphs: [
        "Players must not share private contact details with clubs outside mediated Claim flows. Guardians must only manage linked children and must withdraw consent when appropriate.",
      ],
    },
    {
      heading: "Club and employer responsibilities",
      paragraphs: [
        "Clubs and employers must not scrape the talent pool, harvest personal data, or contact players/candidates outside platform rules. Circumvention of placement mediation may result in suspension.",
      ],
    },
    {
      heading: "Fees",
      paragraphs: [
        "Player membership fees, club licensing and placement fees, and Job+ employer success fees are described on product pages and confirmed at checkout or contract. Candidates never pay Job+ placement fees.",
      ],
    },
    {
      heading: "Acceptable use",
      paragraphs: [
        "Do not upload unlawful content, attempt to access another user’s data, abuse messaging, or interfere with platform security. Safeguarding concerns must be reported through the channels provided.",
      ],
    },
    {
      heading: "Liability and changes",
      paragraphs: [
        "Staging environments are provided as-is. We may update these terms; material changes will be surfaced in-product where accounts exist. Production liability terms will be set by counsel before launch.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        "Questions about these terms can be sent to the email address in the site footer during staging.",
      ],
    },
  ],
}
