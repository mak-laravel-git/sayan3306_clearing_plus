import { Bell, HeartHandshake, MessageSquare, ShieldCheck } from "lucide-react";

import { RoleDashboard } from "@/components/portal/role-dashboard";
import { requirePortal } from "@/lib/auth/dal";

export default async function GuardianDashboardPage() {
  const user = await requirePortal("guardian");

  return (
    <RoleDashboard
      user={user}
      eyebrow="Guardian"
      title={`Welcome, ${user.name}`}
      intro="You see only the young player you are linked to. Here you will give or withdraw consent and follow what is shared about them."
      sections={[
        { title: "Linked player", description: "The one player you look after on Clearing+.", icon: HeartHandshake, items: ["Player summary", "Registration status"] },
        { title: "Consent", description: "What the player's profile may show to verified clubs.", icon: ShieldCheck, items: ["Give consent", "Withdraw consent"] },
        { title: "Messages", description: "Everything sent to the player is also visible to you.", icon: MessageSquare, items: ["Messages with the placement manager"] },
        { title: "Notifications", description: "Reminders and decisions that need your attention.", icon: Bell, items: ["Invitation reminders", "Safeguarding notices"] },
      ]}
    />
  );
}
