"use client";

import { Character } from "@/models/characters";
import { Avatar, AvatarGroup } from "@heroui/react";
import { setCurrentCharacter } from "@/server/actions/character";
import { GAME_ROUTE } from "@/utils/routes";
import { useRouter } from "next/navigation";
import { Tooltip } from "@heroui/tooltip";

export default function CharacterSelection({
  characters,
}: {
  characters: Character[];
}) {
  const router = useRouter();
  return (
    <>
      <h1>Select your character</h1>
      <AvatarGroup isBordered isGrid className="flex gap-4">
        {characters.map((character, idx) => (
          <Tooltip content={character.firstName} key={idx}>
            <Avatar
              src={character.miniAvatarUrl ?? ""}
              name={character.firstName}
              size="lg"
              classNames={{
                base: "cursor-pointer hover:scale-110 w-16 h-16",
              }}
              onClick={async () => {
                try {
                  const success = await setCurrentCharacter(character.id);
                  if (success) {
                    router.push(GAME_ROUTE);
                  }
                } catch (error) {
                  // handle error
                }
              }}
            />
          </Tooltip>
        ))}
      </AvatarGroup>
    </>
  );
}
