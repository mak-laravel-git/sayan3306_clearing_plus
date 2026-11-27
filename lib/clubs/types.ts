/**
 * Shapes the club screens read from the API. No server-only imports: client
 * components use these types too.
 */

export type ClubStatus = "pre_registered" | "active" | "suspended";

export type ClubEmailStatus = "valid" | "missing" | "duplicate" | "invalid";

/** The club code printed in an activation link: `CP-` and eight hex digits. */
export const CLUB_CODE_PATTERN = /^CP-[0-9A-F]{8}$/;

/** Reads a club code the way it is printed (any case, stray spaces); null for anything that is not one. */
export function normalizeClubCode(input: string | null | undefined): string | null {
  const code = (input ?? "").trim().toUpperCase();

  return CLUB_CODE_PATTERN.test(code) ? code : null;
}

export type DirectoryContinent = { slug: string; name: string; countries: number };
export type DirectoryCountry = { slug: string; name: string; leagues: number };
export type DirectoryLeague = { slug: string; name: string; tier: number };

/** What the sign-up page may say about a club. Never an email, phone or contact. */
export type DirectoryClub = {
  code: string;
  name: string;
  country: string;
  league: string;
  state: "available" | "active" | "unavailable";
};

export type ClubTermsText = {
  version: string;
  title: string;
  body: string;
  is_draft: boolean;
};

export type ActivationBlockedReason = "already_active" | "suspended" | "needs_email";

export type ActivationClub = {
  code: string;
  name: string;
  country: string;
  league: string;
  status: ClubStatus;
  can_activate: boolean;
  blocked_reason: ActivationBlockedReason | null;
  /** `a•••@club.com`: enough to recognise the inbox. */
  masked_email: string | null;
  terms: ClubTermsText;
};

export type ClubCredit = {
  type: "founding_licence" | "founding_claim";
  label: string;
  amount_minor: number | null;
  currency: string;
  status: "granted" | "applied" | "expired" | "revoked";
  expires_at: string | null;
};

/** A club as its own people see it. */
export type OwnClub = {
  code: string;
  name: string;
  country: string;
  league: string;
  status: ClubStatus;
  founding_member: boolean;
  activated_at: string | null;
  contact_name: string | null;
  key_contact_role: string | null;
  phone: string | null;
  website: string | null;
  official_email: string | null;
  membership: { role: "club_admin" | "club_user"; is_owner: boolean } | null;
  terms: {
    accepted_version: string | null;
    accepted_at: string | null;
    current_version: string | null;
    needs_acceptance: boolean;
    is_draft: boolean;
  };
  credits: ClubCredit[];
};

export type ClubMember = {
  id: number;
  name: string;
  email: string;
  role: "club_admin" | "club_user";
  role_label: string;
  is_owner: boolean;
  status: "invited" | "active" | "removed";
  two_factor_enabled: boolean;
  joined_at: string | null;
  invited_at: string | null;
};

export type AdminClub = {
  code: string;
  name: string;
  country: string;
  continent: string | null;
  league: string;
  status: ClubStatus;
  is_demo: boolean;
  official_email: string | null;
  email_status: ClubEmailStatus;
  email_note: string | null;
  phone: string | null;
  contact_name: string | null;
  key_contact_role: string | null;
  website: string | null;
  outreach_priority: string | null;
  source_tab: string | null;
  do_not_contact: boolean;
  activation_email_sent_at: string | null;
  activation_link_opened_at: string | null;
  activated_at: string | null;
  activation_reviewed_at: string | null;
  founding_member: boolean;
  terms_version: string | null;
  suspended_at: string | null;
  suspended_reason: string | null;
};

export type AdminClubDetail = AdminClub & {
  allowed_email_domains: string[];
  terms_accepted_at: string | null;
  league_fee_minor: number | null;
  members: ClubMember[];
  credits: (ClubCredit & { granted_at: string; note: string | null })[];
  term_acceptances: { version: string; accepted_at: string; by: string | null; ip_address: string | null }[];
};

export type AdminClubSummary = {
  total: number;
  pre_registered: number;
  active: number;
  suspended: number;
  without_usable_email: number;
  emailed: number;
  link_opened: number;
  unreviewed: number;
};

export type AdminClubList = {
  clubs: AdminClub[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
  summary: AdminClubSummary;
};

export type ClubSettingsValues = {
  founding_deadline: string;
  claim_credit_minor: number;
  claim_credit_valid_days: number;
  official_launch_date: string | null;
  activation_emails_enabled: boolean;
  defaults: { founding_deadline: string; claim_credit_minor: number; claim_credit_valid_days: number };
};

export type LeagueFee = {
  id: number;
  name: string;
  country: string;
  tier: number;
  clubs: number;
  licence_fee_minor: number | null;
};

/** £1,234.50 from pence. */
export function formatMoney(minor: number | null, currency = "GBP"): string {
  if (minor === null) return "Not set";

  return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: minor % 100 === 0 ? 0 : 2 }).format(minor / 100);
}
