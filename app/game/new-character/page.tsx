import { getRaces } from "@/app/actions/game";
import NewCharacterForm from "@/components/forms/NewCharacter";

export default async function NewChacterPage() {
  const races = await getRaces();

  return <NewCharacterForm races={races} />;
}
