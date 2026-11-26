import { BadgeCheck, CreditCard, FileCheck2, Handshake, UserRound, Users } from "lucide-react";

import { RoleDashboard } from "@/components/portal/role-dashboard";
import { requirePortal } from "@/lib/auth/dal";

export default async function PlayerDashboardPage() {
  const user = await requirePortal("player");

  return (
    <RoleDashboard
      user={user}
      eyebrow="Player"
      title={`Welcome, ${user.name}`}
      intro="This is where you will build your football profile, add your documents and follow your registration until your profile goes live to verified clubs."
      sections={[
        { title: "Football profile", description: "Your career so far, in steps you can leave and come back to.", icon: UserRound, items: ["Personal details", "Football history", "Playing information"] },
        { title: "Private documents", description: "Seen only by the platform team, never by clubs.", icon: FileCheck2, items: ["Photo ID", "Release letter"] },
        { title: "Guardian consent", description: "Required while you are under 18.", icon: Users, items: ["Invite your guardian", "Consent status"] },
        { title: "Eligibility and payment", description: "The last steps before your profile goes live.", icon: BadgeCheck, items: ["Eligibility review", "Registration fee", "Live status"] },
        { title: "Club interest", description: "Your placement manager talks to you about every claim.", icon: Handshake, items: ["Claims discussed with you", "Messages from your placement manager"] },
        { title: "Billing", description: "What you paid and when your registration ends.", icon: CreditCard, items: ["Payment history", "Registration expiry"] },
      ]}
    />
  );
}
