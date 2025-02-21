import useSWR from "swr";
import { LocationMessageWithCharacter } from "@/models/locationMessage";

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useLocationMessages(
  locationId: string,
  lastMessageTimestamp: Date | null,
  fetchingInterval: number,
) {
  let lastMessageTimestampString = "";
  if (lastMessageTimestamp)
    lastMessageTimestampString = lastMessageTimestamp.toISOString();

  const { data, error, isLoading, mutate } = useSWR<
    LocationMessageWithCharacter[]
  >(
    `/api/game/location-messages/${locationId}?timestamp=${lastMessageTimestampString}`,
    fetcher,
    {
      refreshInterval: fetchingInterval,
      refreshWhenHidden: false,
      shouldRetryOnError: true,
      revalidateOnFocus: false,
    },
  );

  return {
    messages: data,
    isLoading,
    isError: error,
    mutate,
  };
}
