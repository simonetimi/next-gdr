import AdminControls from "@/components/admin/AdminControls";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { GAME_ROUTE, INDEX_ROUTE } from "@/utils/routes";
import { isAdmin } from "@/server/role";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect(INDEX_ROUTE);
  const isUserAdmin = await isAdmin(session.user.id ?? "");
  if (!isUserAdmin) redirect(GAME_ROUTE);

  return <AdminControls />;
}
