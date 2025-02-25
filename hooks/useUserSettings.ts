import useSWR from "swr";

import { fetcher } from "@/utils/swr";
import { UserSettingsMinimal } from "@/models/userSettings";

export function useUserSettings() {
  const { data, error, isLoading, mutate } = useSWR<UserSettingsMinimal>(
    "/api/game/user/settings",
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: true,
    },
  );

  return {
    userSettings: data,
    isLoading,
    isError: error,
    refreshUserSettings: mutate,
  };
}
