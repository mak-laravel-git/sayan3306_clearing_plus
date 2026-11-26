import { UsersScreen } from "@/components/admin/users/users-screen";
import { listUsers } from "@/lib/admin/users";
import { hasPermission, requirePermission } from "@/lib/auth/dal";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}) {
  const me = await requirePermission("users.view", "admin");
  const params = await searchParams;

  const list = await listUsers({
    q: params.q,
    role: params.role,
    page: Number(params.page) > 0 ? Number(params.page) : 1,
  });

  return (
    <UsersScreen
      list={list}
      meId={String(me.id)}
      canManage={hasPermission(me, "users.manage")}
      canAssign={hasPermission(me, "roles.assign")}
      filters={{ q: params.q ?? "", role: params.role ?? "" }}
    />
  );
}
