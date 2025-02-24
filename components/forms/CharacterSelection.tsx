"use client";

import { Character } from "@/models/characters";
import { addToast, Avatar, AvatarGroup } from "@heroui/react";
import { setCurrentCharacter } from "@/server/actions/character";
import { GAME_ROUTE, NEW_CHARACTER_ROUTE } from "@/utils/routes";
import { useRouter } from "next/navigation";
import { Tooltip } from "@heroui/tooltip";
import { useTranslations } from "next-intl";
import { AuthError } from "next-auth";

export default function CharacterSelection({
  characters,
  maxCharactersAllowed,
}: {
  characters: Character[];
  maxCharactersAllowed: number;
}) {
  const router = useRouter();
  const showAddCharacterButton = characters.length < maxCharactersAllowed;
  const t = useTranslations("components.characterSelection");
  const tError = useTranslations("errors");

  return (
    <>
      <h1>{t("title")}</h1>
      <AvatarGroup isBordered isGrid className="flex gap-4">
        {showAddCharacterButton && (
          <Tooltip content={t("create")}>
            <Avatar
              name="+"
              size="lg"
              classNames={{
                base: "cursor-pointer hover:scale-110 w-16 h-16",
              }}
              onClick={async () => {
                router.push(NEW_CHARACTER_ROUTE);
              }}
            />
          </Tooltip>
        )}
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
                  let errorMessage = t("generic");
                  if (error instanceof Error) {
                    errorMessage = error.message;
                  }
                  addToast({
                    title: tError("title"),
                    description: errorMessage,
                    color: "danger",
                  });
                }
              }}
            />
          </Tooltip>
        ))}
      </AvatarGroup>
    </>
  );
}
