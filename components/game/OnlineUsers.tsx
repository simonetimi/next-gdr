"use client";

import { OnlineUsers as OnlineUsersType } from "@/models/sessions";
import { useTranslations } from "next-intl";
import { Avatar, Spinner } from "@heroui/react";
import { useOnlineCharacters } from "@/hooks/swr/useOnlineCharacters";
import { useGame } from "@/contexts/GameContext";

export default function OnlineUsers() {
  const t = useTranslations();

  const { onlineCharacters, isLoading } = useOnlineCharacters();

  const groupedByLocationGroup = onlineCharacters.reduce(
    (acc, char) => {
      if (char.inSecretLocation) {
        // characters in secret locations go under the secret locations group
        const secretGroup = t("general.secretLocationName");
        if (!acc[secretGroup]) {
          acc[secretGroup] = { "": [] };
        }
        acc[secretGroup][""].push(char);
        return acc;
      }

      if (!char.location && !char.locationGroup) {
        // characters with no location go under the map group
        const mapGroup = t("general.entryLocationName");
        if (!acc[mapGroup]) {
          acc[mapGroup] = { "": [] };
        }
        acc[mapGroup][""].push(char);
        return acc;
      }

      const locationName = char.location?.name ?? "";
      const groupName = char.locationGroup?.name ?? "";

      if (!acc[groupName]) {
        acc[groupName] = {};
      }
      if (!acc[groupName][locationName]) {
        acc[groupName][locationName] = [];
      }
      acc[groupName][locationName].push(char);
      return acc;
    },
    {} as Record<string, Record<string, OnlineUsersType>>,
  );

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // first characters in map, then alphabetically and lastly in secret locations
  const sortedGroups = Object.entries(groupedByLocationGroup).sort(
    ([a], [b]) => {
      const secretGroup = t("general.secretLocations");
      if (a === secretGroup) return 1;
      if (b === secretGroup) return -1;
      if (a === "entry") return -1;
      if (b === "entry") return 1;
      return a.localeCompare(b);
    },
  );

  return (
    <div className="max-h-full space-y-8">
      {sortedGroups.map(([groupName, locations]) => (
        <LocationGroupSection
          key={groupName}
          name={groupName === "entry" ? "" : groupName} // no group name for entry location
          locations={locations}
        />
      ))}
    </div>
  );
}

const LocationGroupSection = ({
  name,
  locations,
}: {
  name: string;
  locations: Record<string, OnlineUsersType>;
}) => (
  <div className="space-y-4">
    {name && (
      <h2 className="border-b border-default-200 pb-2 text-xl font-bold">
        {name}
      </h2>
    )}
    <div className="space-y-4 pl-4">
      {Object.entries(locations)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([locationName, characters]) => (
          <LocationGroup
            key={locationName}
            name={locationName}
            characters={characters}
          />
        ))}
    </div>
  </div>
);

// sorts characters alphabetically and renders them
const LocationGroup = ({
  name,
  characters,
}: {
  name: string;
  characters: OnlineUsersType;
}) => (
  <div>
    {name && (
      <h3 className="mb-2 rounded rounded-2xl border border-default-200 p-4 text-center font-bold">
        {name}
      </h3>
    )}
    <ul className="space-y-2">
      {characters
        .sort((a, b) =>
          `${a.character.firstName} ${a.character.lastName}`.localeCompare(
            `${b.character.firstName} ${b.character.lastName}`,
          ),
        )
        .map((char) => (
          <CharacterItem
            key={`${char.character.firstName}-${char.character.lastName}`}
            character={char.character}
            race={char.race}
          />
        ))}
    </ul>
  </div>
);

const CharacterItem = ({
  character,
  race,
}: {
  character: {
    id: string;
    firstName: string;
    lastName: string;
    miniAvatarUrl: string | null;
  };
  race: { name: string };
}) => {
  // the character sheet state is controlled in the context
  const game = useGame();
  const handleOnAvatarClick = () => {
    game.toggleCharacterSheet(character.id);
  };

  return (
    <li className="flex items-center gap-2 p-2">
      <Avatar
        src={character.miniAvatarUrl ?? ""}
        name={character.firstName}
        onClick={handleOnAvatarClick}
        className="cursor-pointer"
      />
      <span>
        {character.firstName} {character.lastName}
      </span>
      <span className="text-sm text-foreground-600">({race.name})</span>
    </li>
  );
};
