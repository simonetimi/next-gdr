"use client";

import { useEffect, useState } from "react";
import { getOnlineCharacters } from "@/server/actions/character";
import { OnlineUsers as OnlineUsersType } from "@/models/sessions";
import { useTranslations } from "next-intl";
import { Avatar } from "@heroui/react";

export default function OnlineUsers() {
  const [onlineCharacters, setOnlineCharacters] = useState<OnlineUsersType>([]);
  const t = useTranslations("general");

  useEffect(() => {
    (async () => {
      try {
        const response = await getOnlineCharacters();
        setOnlineCharacters(response);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  // Group characters by location
  const groupedByLocation = onlineCharacters.reduce(
    (acc, char) => {
      const locationName = char.location?.name ?? t("entryLocationName");
      if (!acc[locationName]) {
        acc[locationName] = [];
      }
      acc[locationName].push(char);
      return acc;
    },
    {} as Record<string, OnlineUsersType>,
  );

  return (
    <div className="space-y-4">
      {Object.entries(groupedByLocation)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([locationName, characters]) => (
          <LocationGroup
            key={locationName}
            name={locationName}
            characters={characters}
          />
        ))}
    </div>
  );
}

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
