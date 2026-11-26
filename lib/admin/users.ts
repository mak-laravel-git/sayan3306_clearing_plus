import "server-only";

import { authedRequest } from "@/lib/auth/api";
import type { User, UserRole } from "@/types/auth";

export type ManagedUser = User & { created_at: string };

export type UserList = {
  users: ManagedUser[];
  meta: { current_page: number; per_page: number; total: number; last_page: number };
};

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "platform_admin", label: "Platform admin" },
  { value: "ppm", label: "Player placement manager" },
  { value: "player", label: "Player" },
  { value: "guardian", label: "Guardian" },
  { value: "club_admin", label: "Club admin" },
  { value: "club_user", label: "Club user" },
  { value: "employer", label: "Employer" },
];

export async function listUsers(input: { q?: string; role?: string; page?: number }): Promise<UserList> {
  const params = new URLSearchParams({ per_page: "20", page: String(input.page ?? 1), sort: "-created_at" });
  if (input.q?.trim()) params.set("filter[q]", input.q.trim());
  if (input.role) params.set("filter[role]", input.role);

  return authedRequest<UserList>("get", `/admin/users?${params.toString()}`);
}

export async function createUser(input: { name: string; email: string; role: UserRole }) {
  return authedRequest<{ user: ManagedUser }>("post", "/admin/users", input);
}

export async function changeRole(id: string | number, role: UserRole) {
  return authedRequest<{ user: ManagedUser }>("put", `/admin/users/${id}/role`, { role });
}

export async function setExtraPpm(id: string | number, enabled: boolean) {
  return authedRequest<{ user: ManagedUser }>("put", `/admin/users/${id}/ppm`, { enabled });
}

export async function suspendUser(id: string | number) {
  return authedRequest<{ user: ManagedUser }>("post", `/admin/users/${id}/suspend`);
}

export async function reinstateUser(id: string | number) {
  return authedRequest<{ user: ManagedUser }>("post", `/admin/users/${id}/reinstate`);
}

export async function resendInvitation(id: string | number) {
  return authedRequest<null>("post", `/admin/users/${id}/resend-invitation`);
}
