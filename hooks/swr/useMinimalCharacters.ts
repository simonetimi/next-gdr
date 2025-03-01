import useSWR from "swr";
import { fetcher } from "@/utils/swr";
import { MinimalCharacter } from "@/models/characters";

export function useMinimalCharacters() {
  const { data, error, isLoading, mutate } = useSWR<MinimalCharacter[]>(
    "/api/game/characters/minimal",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    characters: data || [],
    isLoading,
    error,
    mutate,
  };
}
