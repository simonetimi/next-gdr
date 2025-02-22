import useSWR from "swr";
import { fetcher } from "@/utils/swr";

export function useInvisibleStatus() {
  const { data, error, mutate } = useSWR<{ invisible: boolean }>(
    "/api/game/character/invisible",
    fetcher,
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    isInvisible: data?.invisible ?? false,
    isLoading: !error && !data,
    error,
    mutate,
  };
}
