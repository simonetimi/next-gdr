import { GAME_ROUTE } from "@/utils/routes";
import { redirect } from "next/navigation";

export default function NotFound() {
  redirect(GAME_ROUTE);
}
