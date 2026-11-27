import { ClubsScreen } from "@/components/admin/clubs/clubs-screen";
import { listClubs } from "@/lib/admin/clubs";
import { hasPermission, requirePermission } from "@/lib/auth/dal";

type Params = {
  q?: string;
  status?: string;
  email_status?: string;
  unreviewed?: string;
  emailed?: string;
  page?: string;
  export_error?: string;
};

export default async function ClubsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const me = await requirePermission("clubs.view", "admin");
  const params = await searchParams;

  const filters = {
    q: params.q,
    status: params.status,
    email_status: params.email_status,
    unreviewed: params.unreviewed === "1",
    emailed: params.emailed === "yes" ? ("yes" as const) : params.emailed === "no" ? ("no" as const) : ("" as const),
    page: Number(params.page) > 0 ? Number(params.page) : 1,
  };

  const list = await listClubs(filters);

  return <ClubsScreen list={list} filters={filters} canSend={hasPermission(me, "clubs.activation.send")} exportError={params.export_error} />;
}
