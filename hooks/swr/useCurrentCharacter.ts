import useSWR from "swr";
import { fetcher } from "@/utils/swr";
import { MinimalCharacter } from "@/models/characters";

export function useCurrentCharacter() {
  const { data, error, isLoading, mutate } = useSWR<MinimalCharacter>(
    "/api/game/character/current",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    currentCharacter: data,
    isLoading,
    error,
    mutate,
  };
}
