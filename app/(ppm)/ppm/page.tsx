import { CalendarClock, ClipboardCheck, Inbox, Siren, Briefcase } from "lucide-react";

import { RoleDashboard } from "@/components/portal/role-dashboard";
import { requirePortal } from "@/lib/auth/dal";

export default async function PpmDashboardPage() {
  const user = await requirePortal("ppm");

  return (
    <RoleDashboard
      user={user}
      eyebrow="Player placement manager"
      title={`Welcome, ${user.name}`}
      intro="You work only on the claims and players assigned to you. This is where your queue, your conversations and your follow-ups will be."
      sections={[
        { title: "Claim queue", description: "New claims, claims waiting for a player discussion, holds and trials.", icon: Inbox, items: ["New claims", "Awaiting discussion", "Holds"] },
        { title: "Credibility review", description: "Approve or reject a claim, with the reason on record.", icon: ClipboardCheck, items: ["Review a claim", "Reasons"] },
        { title: "Conversations", description: "Separate threads with clubs and with players and guardians.", icon: CalendarClock, items: ["Club threads", "Player and guardian threads"] },
        { title: "Job+ work", description: "CV reviews, introductions and the 30 and 90 day check-ins.", icon: Briefcase, items: ["CV review", "Introductions", "Follow-ups"] },
        { title: "Safeguarding", description: "Concerns raised on a profile or a conversation.", icon: Siren, items: ["Open concerns"] },
      ]}
    />
  );
}
