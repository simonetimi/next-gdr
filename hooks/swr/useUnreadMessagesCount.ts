import useSWR from "swr";
import { fetcher } from "@/utils/swr";

export function useUnreadMessagesCount() {
  const { data, error, mutate } = useSWR<{ off: number; on: number }>(
    "/api/game/chat/unread",
    fetcher,
    {
      refreshInterval: 1000 * 30, // 30 seconds
      revalidateIfStale: true,
      revalidateOnFocus: true,
    },
  );

  return {
    onCount: data?.on,
    offCount: data?.off,
    error,
    mutate,
  };
}
