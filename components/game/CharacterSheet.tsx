"use client";

import { useEffect, useState } from "react";
import { getCharacterSheet } from "@/server/actions/character";
import { CharacterScheetWithCharacter } from "@/models/characters";
import { Avatar, Spinner } from "@heroui/react";

function CharacterSheet({ characterId }: { characterId: string }) {
  const [characterSheet, setCharacterSheet] =
    useState<CharacterScheetWithCharacter | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const result = await getCharacterSheet(characterId);
        console.log(result);
        setCharacterSheet(result);
      } catch (error) {
        // handle error
      }
    })();
  }, [characterId]);

  if (!characterSheet)
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <div className="flex flex-col gap-6 p-4">
      <h2>Name: {characterSheet?.character.firstName}</h2>
      <h2>Last name: {characterSheet?.character.lastName}</h2>
      {characterSheet?.character.miniAvatarUrl && (
        <Avatar src={characterSheet?.character.miniAvatarUrl} />
      )}
    </div>
  );
}

export default CharacterSheet;
