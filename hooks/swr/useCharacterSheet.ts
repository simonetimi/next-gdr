import useSWR from "swr";
import { fetcher } from "@/utils/swr";
import { CharacterScheetWithCharacter } from "@/models/characters";

export function useCharacterSheet(characterId: string) {
  const { data, error, isLoading } = useSWR<CharacterScheetWithCharacter>(
    `/api/game/character/character-sheet/${characterId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    characterSheet: data || null,
    isLoading,
    error,
  };
}
