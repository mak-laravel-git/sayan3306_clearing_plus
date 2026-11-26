import { SecurityPolicyScreen } from "@/components/admin/security/security-policy-screen";
import { getSecurityPolicy } from "@/lib/admin/security-policy";
import { requirePermission } from "@/lib/auth/dal";

export default async function SecurityPolicyPage() {
  await requirePermission("security.policy.manage", "admin");

  return <SecurityPolicyScreen initial={await getSecurityPolicy()} />;
}
