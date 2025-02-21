"use client";

import { useEffect, useState } from "react";
import { getCharacterSheet } from "@/server/actions/character";
import { CharacterScheetWithCharacter } from "@/models/characters";
import { addToast, Avatar, Spinner } from "@heroui/react";
import { useTranslations } from "next-intl";

function CharacterSheet({ characterId }: { characterId: string }) {
  const t = useTranslations();
  const [characterSheet, setCharacterSheet] =
    useState<CharacterScheetWithCharacter | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const result = await getCharacterSheet(characterId);
        setCharacterSheet(result);
      } catch (error) {
        let errorMessage = t("errors.generic");
        if (error instanceof Error) errorMessage = error.message;
        addToast({
          title: t("errors.title"),
          description: errorMessage,
          color: "danger",
        });
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
