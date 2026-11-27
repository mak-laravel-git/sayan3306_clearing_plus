import { Badge } from "@/components/ui/badge";
import type { ClubEmailStatus, ClubStatus } from "@/lib/clubs/types";

export function ClubStatusBadge({ status }: { status: ClubStatus }) {
  if (status === "active") return <Badge>Active</Badge>;
  if (status === "suspended") return <Badge variant="destructive">Suspended</Badge>;

  return <Badge variant="secondary">Pre-registered</Badge>;
}

const EMAIL_LABEL: Record<ClubEmailStatus, string> = {
  valid: "Email ready",
  missing: "No email",
  duplicate: "Shared email",
  invalid: "Email to fix",
};

export function EmailStatusBadge({ status }: { status: ClubEmailStatus }) {
  return (
    <Badge variant={status === "valid" ? "outline" : "destructive"} className="mt-1">
      {EMAIL_LABEL[status]}
    </Badge>
  );
}
