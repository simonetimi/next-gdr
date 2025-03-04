"use client";

import { Avatar, Spinner } from "@heroui/react";
import { useCharacterSheet } from "@/hooks/swr/useCharacterSheet";

function CharacterSheet({ characterId }: { characterId: string }) {
  const { characterSheet, isLoading } = useCharacterSheet(characterId);

  if (isLoading)
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
