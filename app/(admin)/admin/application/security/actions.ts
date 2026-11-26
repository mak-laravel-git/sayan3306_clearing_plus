"use server";

import { revalidatePath } from "next/cache";

import { toResult } from "@/lib/actions/result";
import { saveSecurityPolicy, type RolePolicy, type SecurityPolicy } from "@/lib/admin/security-policy";
import { requirePermission } from "@/lib/auth/dal";

export type SecurityPolicyResult =
  | { ok: true; message: string; policy: SecurityPolicy }
  | { ok: false; message: string };

export async function saveSecurityPolicyAction(
  roles: Record<string, Partial<RolePolicy>>,
): Promise<SecurityPolicyResult> {
  try {
    await requirePermission("security.policy.manage", "admin");
    const policy = await saveSecurityPolicy(roles);
    revalidatePath("/admin/application/security");
    return { ok: true, message: "Security policy saved.", policy };
  } catch (error) {
    return toResult(error, "Unable to save the security policy.") as { ok: false; message: string };
  }
}
