"use client";

import { useEffect, useState } from "react";
import { getOnlineCharacters } from "@/server/character";
import { OnlineUsers as OnlineUsersType } from "@/models/sessions";
import { useTranslations } from "next-intl";
import { addToast, Avatar, Spinner } from "@heroui/react";

export default function OnlineUsers() {
  const [onlineCharacters, setOnlineCharacters] = useState<OnlineUsersType>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations();

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/game/characters/online");

      if (!response.ok) {
        setIsLoading(false);
        return addToast({
          title: t("errors.title"),
          description: (await response.json()).error || t("errors.generic"),
          color: "danger",
        });
      }

      const data = await response.json();
      setOnlineCharacters(data);
      setIsLoading(false);
    })();
  }, [t]);

  const groupedByLocationGroup = onlineCharacters.reduce(
    (acc, char) => {
      if (!char.location && !char.locationGroup) {
        // Characters with no location and no group go to entry location
        const entryLocation = t("general.entryLocationName");
        if (!acc["entry"]) {
          acc["entry"] = {};
        }
        if (!acc["entry"][entryLocation]) {
          acc["entry"][entryLocation] = [];
        }
        acc["entry"][entryLocation].push(char);
        return acc;
      }

      const locationName = char.location?.name ?? t("entryLocationName");
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

  // Sort groups to ensure "map" appears first, then alphabetically
  const sortedGroups = Object.entries(groupedByLocationGroup).sort(
    ([a], [b]) => {
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
          name={groupName === "entry" ? "" : groupName} // No group name for entry location
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
    {name && <h2 className="border-b pb-2 text-xl font-bold">{name}</h2>}
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
    <h3 className="mb-2 rounded border p-4 text-center font-bold">{name}</h3>
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

// TODO movable to open character sheet
const CharacterItem = ({
  character,
  race,
}: {
  character: {
    firstName: string;
    lastName: string;
    miniAvatarUrl: string | null;
  };
  race: { name: string };
}) => (
  <li className="flex items-center gap-2 p-2">
    <Avatar src={character.miniAvatarUrl ?? ""} name={character.firstName} />
    <span>
      {character.firstName} {character.lastName}
    </span>
    <span className="text-sm text-gray-500">({race.name})</span>
  </li>
);
