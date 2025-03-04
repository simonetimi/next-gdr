import { Autocomplete, AutocompleteItem, Avatar } from "@heroui/react";
import { useTranslations } from "next-intl";
import { MinimalCharacter } from "@/models/characters";

interface ParticipantSelectorProps {
  characters: MinimalCharacter[];
  isLoading: boolean;
  value: string;
  onChange: (characterId: string) => void;
  excludeIds?: string[];
}

export default function ParticipantSelector({
  characters,
  isLoading,
  value,
  onChange,
  excludeIds = [],
}: ParticipantSelectorProps) {
  const t = useTranslations();

  // filter out excluded characters
  const filteredCharacters = characters?.filter(
    (character) => !excludeIds.includes(character.id),
  );

  return (
    <Autocomplete
      label={t("components.gameChat.selectCharacter")}
      isLoading={isLoading}
      listboxProps={{
        emptyContent: t("components.gameChat.noMoreCharacters"),
      }}
      selectedKey={value || undefined}
      onSelectionChange={(key) => {
        if (key && typeof key === "string") {
          onChange(key);
        }
      }}
    >
      {filteredCharacters?.map((character) => (
        <AutocompleteItem
          key={character.id}
          textValue={character.firstName}
          startContent={
            <Avatar
              showFallback
              className="h-6 w-6"
              name={character.firstName[0]}
              src={character.miniAvatarUrl ?? undefined}
            />
          }
        >
          {character.firstName}
        </AutocompleteItem>
      ))}
    </Autocomplete>
  );
}
