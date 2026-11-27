import { notFound } from "next/navigation";

import { ClubDetail } from "@/components/admin/clubs/club-detail";
import { getClubDetail } from "@/lib/admin/clubs";
import { ApiError } from "@/lib/auth/api-error";
import { hasPermission, requirePermission } from "@/lib/auth/dal";
import { normalizeClubCode, type AdminClubDetail } from "@/lib/clubs/types";

export default async function ClubDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const me = await requirePermission("clubs.view", "admin");
  const code = normalizeClubCode((await params).code);

  if (code === null) notFound();

  let club: AdminClubDetail;

  try {
    club = await getClubDetail(code);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();

    throw error;
  }

  return (
    <ClubDetail
      club={club}
      can={{
        manage: hasPermission(me, "clubs.manage"),
        send: hasPermission(me, "clubs.activation.send"),
        suspend: hasPermission(me, "clubs.suspend"),
      }}
    />
  );
}
