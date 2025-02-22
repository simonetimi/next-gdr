import { useState } from "react";
import useSWR from "swr";
import { LocationMessageWithCharacter } from "@/models/locationMessage";
import { fetcher } from "@/utils/swr";

export function useLocationMessages(locationId: string) {
  const fetchingInterval = 1000 * 30; // 30 seconds
  const [lastTimestamp, setLastTimestamp] = useState<Date | null>(null);
  const [accumulatedMessages, setAccumulatedMessages] = useState<
    LocationMessageWithCharacter[]
  >([]);

  const swrKey = `/api/game/location-messages/${locationId}?timestamp=${lastTimestamp?.toISOString() ?? ""}`;

  const { isLoading, mutate, error } = useSWR<LocationMessageWithCharacter[]>(
    swrKey,
    fetcher,
    {
      refreshInterval: fetchingInterval,
      refreshWhenHidden: false,
      shouldRetryOnError: true,
      revalidateOnFocus: true,
      keepPreviousData: true,
      onSuccess: (newMessages = []) => {
        if (newMessages.length > 0) {
          setLastTimestamp(new Date(newMessages[0].message.createdAt));
          setAccumulatedMessages((prev) => [...newMessages, ...prev]);
        }
      },
    },
  );

  return {
    messages: accumulatedMessages,
    isRefetching: accumulatedMessages.length > 0 && isLoading,
    mutate,
    error,
    initialLoading: accumulatedMessages.length === 0 && isLoading,
  };
}
