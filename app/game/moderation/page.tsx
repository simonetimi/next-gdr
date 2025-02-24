import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { GAME_ROUTE, INDEX_ROUTE } from "@/utils/routes";
import { isMaster } from "@/server/role";
import ModerationControls from "@/components/admin/ModerationControls";

export default async function ModerationPage() {
  const session = await auth();
  if (!session) redirect(INDEX_ROUTE);
  const isUserMaster = await isMaster(session.user.id ?? "");

  if (!isUserMaster) redirect(GAME_ROUTE);

  return <ModerationControls />;
}
