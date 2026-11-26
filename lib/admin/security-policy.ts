import "server-only";

import { authedRequest } from "@/lib/auth/api";

export type RolePolicy = {
  require_email_verification: boolean;
  require_two_factor: boolean;
  idle_minutes: number;
};

export type RolePolicyRow = RolePolicy & {
  role: string;
  label: string;
  defaults: RolePolicy;
};

export type SecurityPolicy = {
  roles: RolePolicyRow[];
  limits: { min_idle_minutes: number; max_idle_minutes: number };
  /** False when no mail server is set up: a code could not reach anyone. */
  mail_ready: boolean;
};

export async function getSecurityPolicy(): Promise<SecurityPolicy> {
  return authedRequest<SecurityPolicy>("get", "/admin/security-policy");
}

export async function saveSecurityPolicy(roles: Record<string, Partial<RolePolicy>>): Promise<SecurityPolicy> {
  return authedRequest<SecurityPolicy>("put", "/admin/security-policy", { roles });
}
