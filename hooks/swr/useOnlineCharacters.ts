import useSWR from "swr";

import { fetcher } from "@/utils/swr";
import { OnlineUsers as OnlineUsersType } from "@/models/sessions";

export function useOnlineCharacters() {
  const { data, error, isLoading } = useSWR<OnlineUsersType>(
    "/api/game/characters/online",
    fetcher,
    {
      refreshInterval: 1000 * 60,
      revalidateOnFocus: true,
    },
  );

  return {
    onlineCharacters: data || [],
    isLoading,
    isError: error,
  };
}
