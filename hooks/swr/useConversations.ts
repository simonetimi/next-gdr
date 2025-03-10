import useSWR from "swr";
import { fetcher } from "@/utils/swr";
import { OffGameConversationWithDetails } from "@/models/offGameChat";

export function useConversations(chatType: "on" | "off") {
  const { data, error, isLoading, mutate } = useSWR<
    OffGameConversationWithDetails[]
  >(`/api/game/chat/${chatType}/conversations/`, fetcher, {
    refreshInterval: 1000 * 60, // 1 minute
    revalidateOnFocus: true,
    revalidateOnMount: true,
  });

  return {
    conversations: data,
    isLoading,
    isError: error,
    refreshConversations: mutate,
  };
}
