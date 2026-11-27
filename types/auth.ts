/**
 * The roles of the platform. A user works as one of them. Platform staff are a
 * super admin (settings, security, fees, other admins) or an admin (operations:
 * clubs, people, audit). A club person is a club admin or a club user.
 */
export type UserRole =
  | "platform_super_admin"
  | "platform_admin"
  | "ppm"
  | "player"
  | "guardian"
  | "club_admin"
  | "club_user"
  | "employer";

/** The dashboard a role works in; it is also the URL prefix. */
export type PortalKey = "admin" | "ppm" | "player" | "guardian" | "club" | "employer";

export type ThemePreference = "light" | "dark" | "system";

/** The club a club person works for. Always the one of their own membership. */
export type ClubSummary = {
  code: string;
  name: string;
  status: "pre_registered" | "active" | "suspended";
  role: "club_admin" | "club_user";
  is_owner: boolean;
};

export type User = {
  id: string | number;
  name: string;
  email: string;
  avatar?: string | null;
  /** The role this account works as (null only for an account with no role). */
  role: UserRole | null;
  roles: UserRole[];
  /** What the role may do; used to show or hide menu items. The API decides on every call. */
  permissions: string[];
  portal: PortalKey | null;
  /** The club of a club admin or club user; null for everybody else. */
  club?: ClubSummary | null;
  requirements?: {
    two_factor_setup_needed: boolean;
    idle_minutes: number;
  };
  status?: "active" | "unverified" | "suspended";
  email_verified_at?: string | null;
  two_factor_enabled: boolean;
  email_notifications?: boolean;
  push_notifications?: boolean;
  theme?: ThemePreference;
  timezone?: string | null;
};

/** Encrypted into the httpOnly session cookie. Never sent to the browser as JS-readable JSON. */
export type SessionPayload = {
  /** Sanctum personal access token. Laravel rejects it after `sessionEndsAt`. */
  accessToken: string;
  /** Absolute sign-in deadline in ms: 12 hours, or 30 days with Remember me. */
  sessionEndsAt: number;
  user: User;
};

export type LaravelTokenResponse = {
  access_token: string;
  token_type: string;
  /** Unix seconds. Matches the token's `expires_at` in Laravel. */
  session_ends_at: number;
};

export type DeviceStatus = "active" | "expired" | "revoked";

export type DeviceRevokedReason =
  | "signed_out"
  | "revoked"
  | "signed_out_everywhere"
  | "password_changed"
  | "password_reset"
  | "idle_timeout";

export type UserDevice = {
  id: number;
  browser: string | null;
  platform: string | null;
  device_type: "desktop" | "mobile" | "tablet" | "unknown";
  ip_address: string | null;
  remember: boolean;
  status: DeviceStatus;
  is_current: boolean;
  signed_in_at: string | null;
  last_active_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  revoked_reason: DeviceRevokedReason | null;
};

export type PaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

/** Returned by /auth/login when the account has 2FA enabled, instead of a token pair. */
export type TwoFactorChallengeResponse = {
  two_factor: true;
  challenge_token: string;
};

/** Returned by /auth/login and /auth/register while the email address still has to be verified. */
export type VerificationChallengeResponse = {
  verification_required: true;
  email: string;
  challenge_token: string;
};
