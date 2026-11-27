import { FileSearch, Handshake, Receipt, Star, UsersRound } from "lucide-react";

import { ClubOverview } from "@/components/club/club-overview";
import { RoleDashboard } from "@/components/portal/role-dashboard";
import { hasPermission, requirePermission } from "@/lib/auth/dal";
import { getOwnClub } from "@/lib/clubs/club";

export default async function ClubDashboardPage() {
  const user = await requirePermission("club.view", "club");
  const club = await getOwnClub();
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
      top={<ClubOverview club={club} canAcceptTerms={hasPermission(user, "club.terms.accept")} />}
      sections={[
        { title: "Player search", description: "Only approved, live and consented players appear.", icon: FileSearch, items: ["Filters and sorting", "Player profiles"] },
        { title: "Shortlist", description: "Private to your club, with notes your staff can see.", icon: Star, items: ["Shortlisted players", "Private notes"] },
        { title: "Claims", description: "Each claim goes to a placement manager, never straight to a player.", icon: Handshake, items: ["Submit a claim", "Claim status"] },
        ...(admin ? [{ title: "Billing", description: "Licence, monthly invoices and credits.", icon: Receipt, items: ["Invoices", "Payment method"] }] : []),
        { title: "Your team", description: "The people of your club.", icon: UsersRound, items: ["Invite colleagues", "Roles"] },
      ]}
    />
  );
}
