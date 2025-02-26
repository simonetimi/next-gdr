import useSWR from "swr";
import { fetcher } from "@/utils/swr";
import { OffGameConversationWithDetails } from "@/models/offGameChat";

export function useOffGameConversations() {
  const { data, error, isLoading, mutate } = useSWR<
    OffGameConversationWithDetails[]
  >("/api/conversations", fetcher, {
    refreshInterval: 1000 * 60, // 1 minute
  });

  return {
    conversations: data,
    isLoading,
    isError: error,
    mutate,
  };
}
