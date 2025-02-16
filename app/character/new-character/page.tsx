import { getAllRaces } from "@/server/actions/game";
import NewCharacterForm from "@/components/forms/NewCharacter";
import { auth } from "@/auth";

import { GAME_ROUTE } from "@/utils/routes";
import { redirect } from "next/navigation";
import { getCharacters } from "@/server/actions/character";

export default async function NewChacterPage() {
  const session = await auth();
  if (session?.user) {
    const characters = await getCharacters();
    // FIX NOT PARSING ENV VARIABLE CORRECTLY33
    if (characters.length >= parseInt(process.env.MAX_CHARACTERS_ALLOWED!))
      redirect(GAME_ROUTE);
  }

  const races = await getAllRaces();

  return <NewCharacterForm races={races} />;
}
