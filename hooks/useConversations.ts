import useSWR from "swr";
import { fetcher } from "@/utils/swr";
import { OffGameConversationWithDetails } from "@/models/offGameChat";

// todo implement param to switch between off and on game fetching

export function useConversations(chatType: "on" | "off") {
  const { data, error, isLoading, mutate } = useSWR<
    OffGameConversationWithDetails[]
  >(`/api/game/chat/${chatType}/conversations/`, fetcher, {
    refreshInterval: 1000 * 60, // 1 minute
  });

  return {
    conversations: data,
    isLoading,
    isError: error,
    mutate,
  };
}
