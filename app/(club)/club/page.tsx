import { FileSearch, Handshake, Receipt, Star, UsersRound } from "lucide-react";

import { RoleDashboard } from "@/components/portal/role-dashboard";
import { requirePortal } from "@/lib/auth/dal";

export default async function ClubDashboardPage() {
  const user = await requirePortal("club");
  const admin = user.role === "club_admin";

  return (
    <RoleDashboard
      user={user}
      eyebrow={admin ? "Club admin" : "Club"}
      title={`Welcome, ${user.name}`}
      intro={
        admin
          ? "You manage your club's account: staff, terms and billing, as well as the player search and claims your staff use."
          : "Search players, keep a private shortlist and submit claims for your club. Staff and billing are managed by your club admin."
      }
      sections={[
        { title: "Player search", description: "Only approved, live and consented players appear.", icon: FileSearch, items: ["Filters and sorting", "Player profiles"] },
        { title: "Shortlist", description: "Private to your club, with notes your staff can see.", icon: Star, items: ["Shortlisted players", "Private notes"] },
        { title: "Claims", description: "Each claim goes to a placement manager, never straight to a player.", icon: Handshake, items: ["Submit a claim", "Claim status"] },
        ...(admin
          ? [
              { title: "Club staff", description: "People from your club's official email domain.", icon: UsersRound, items: ["Invite staff", "Remove staff"] },
              { title: "Billing and terms", description: "Licence, monthly invoices and the club terms you accepted.", icon: Receipt, items: ["Invoices", "Accepted terms"] },
            ]
          : []),
      ]}
    />
  );
}
