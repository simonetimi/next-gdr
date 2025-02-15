"use client";

import { useEffect, useState } from "react";
import { getCharacterSheet } from "@/server/actions/character";
import { CharacterScheetWithCharacter } from "@/models/characters";

function CharacterSheet({ characterId }: { characterId: string }) {
  const [characterSheet, setCharacterSheet] =
    useState<CharacterScheetWithCharacter | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const result = await getCharacterSheet(characterId);
        setCharacterSheet(result);
      } catch (error) {
        // handle error
      }
    })();
  }, [characterId]);

  return (
    <div>
      <h1>Character sheet Component (test)</h1>
      <h2>{characterSheet?.character.firstName}</h2>
    </div>
  );
}

export default CharacterSheet;
