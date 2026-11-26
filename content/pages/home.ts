export const homePage = {
  eyebrow: "Clearing+",
  heading: "Your Next Chapter in Football Starts Here.",
  lead: "A welfare-first platform for released academy players aged 16+. Verified clubs. Guardian safeguards. A human placement manager on every Claim.",
  heroCtas: [
    { href: "/players", label: "I’m a player", variant: "light" as const },
    { href: "/clubs", label: "I’m a club", variant: "outline" as const },
    { href: "/parents", label: "I’m a parent", variant: "outline" as const },
  ],
  stepsHeading: "Four steps from release to your next club.",
  stepsIntro: "A clear route back into football — with consent, verification and mediation at every stage.",
  steps: [
    {
      step: "01",
      title: "Create your profile",
      description: "Build a football profile with career history, positions and approved media.",
    },
    {
      step: "02",
      title: "Verify & consent",
      description: "Admin eligibility checks, guardian consent for 16–17s, and registration.",
    },
    {
      step: "03",
      title: "Get discovered",
      description: "Verified clubs search consented, live profiles — never your private contacts.",
    },
    {
      step: "04",
      title: "Claim with a PPM",
      description: "Every Claim is mediated by a Player Placement Manager through to trial or signing.",
    },
  ],
  claimStrip: {
    eyebrow: "Every step managed",
    heading: "Clubs claim. You decide with support.",
    lead: "Clubs shortlist and submit a formal Claim. Your PPM records discussions and the player or guardian decision — no open inbox of strangers.",
  },
  audiences: [
    {
      eyebrow: "Players",
      title: "Released isn’t the end. It’s a reset.",
      body: "Make your academy career visible to verified clubs while keeping phone, email, address and documents private.",
      href: "/players",
      cta: "Explore for players",
    },
    {
      eyebrow: "Parents",
      title: "Support their next step — safely.",
      body: "Guardian consent, mirrored messages for under-18s, and clear safeguarding routes built into the journey.",
      href: "/parents",
      cta: "Explore for parents",
    },
    {
      eyebrow: "Clubs",
      title: "Recruit verified academy talent.",
      body: "Search consented profiles, shortlist, submit Claims, and work with a PPM — without bypassing the platform.",
      href: "/clubs",
      cta: "Explore for clubs",
    },
  ],
  humanMiddle: {
    eyebrow: "Human in the middle",
    heading: "Every Claim has a placement manager.",
    lead: "Credibility review, guarded communication, trial coordination and outcomes stay auditable inside Clearing+.",
    points: [
      { title: "Mediated contact", description: "Clubs do not get direct player contacts by default." },
      { title: "Guardian mirroring", description: "Under-18 communications stay visible to linked guardians." },
      { title: "Audit trail", description: "Profile views, Claims and decisions are recorded." },
      { title: "Welfare first", description: "Safeguarding concerns have a clear reporting path." },
    ],
  },
  safety: {
    eyebrow: "Built for trust",
    heading: "Safety and privacy by design.",
    items: [
      { title: "No public directory", description: "Profiles are only searchable by verified, eligible clubs." },
      { title: "Consent gates", description: "Names and photos appear only after approval and consent." },
      { title: "Admin-only documents", description: "ID and release letters never reach clubs or employers." },
      { title: "UK GDPR ready", description: "Data minimisation and children’s code thinking from day one." },
      { title: "Verified payments", description: "Paid state comes from Stripe webhooks, not redirects alone." },
      { title: "Job+ opt-in", description: "Career transition stays voluntary, with separate Job+ terms." },
    ],
  },
  beta: {
    title: "Shape the platform as a founding member.",
    lead: "Register interest to join the early cohort of players, parents and clubs building Clearing+ with us.",
  },
  impact: {
    eyebrow: "Give back",
    heading: "5% back to the grassroots game.",
    lead: "A ring-fenced share of platform revenue supports grassroots football. Transparent reporting is part of the programme.",
    href: "/grassroots",
  },
  testimonial: {
    quote: "Your skills go beyond the pitch — and your next chapter should too.",
    attribution: "Clearing+ mission",
  },
  faqHeading: "Questions, answered.",
  faq: [
    {
      question: "Who can register?",
      answer:
        "Eligible released academy football players aged 16+, with guardian involvement where required. Clubs and employers register through their own verification flows.",
    },
    {
      question: "How does a Claim work?",
      answer:
        "A verified club submits a Claim on a live profile. A Player Placement Manager mediates contact, records decisions, and supports trial or signing outcomes.",
    },
    {
      question: "Will clubs see my phone number?",
      answer:
        "No. Clubs see consented football information only. Contact details and identity documents stay private unless a later, exceptional, audited process applies.",
    },
    {
      question: "What is Job+?",
      answer:
        "Job+ is the related career pathway for non-football work in the UK. Players opt in from Clearing+; employers use jobplus.academy.",
    },
  ],
  finalCta: {
    title: "Ready for your next chapter?",
    lead: "Register interest to join Clearing+ — whether you are a player, parent or club.",
  },
}
