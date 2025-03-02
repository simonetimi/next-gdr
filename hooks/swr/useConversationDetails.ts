import useSWR from "swr";
import { fetcher } from "@/utils/swr";
import { ConversationDetails } from "@/models/offGameChat";

export function useConversationDetails(
  chatType: "on" | "off",
  conversationId: string,
) {
  const { data, error, isLoading, mutate } = useSWR<ConversationDetails>(
    conversationId
      ? `/api/game/chat/${chatType}/conversation/details/${conversationId}`
      : null,
    fetcher,
    {
      revalidateOnMount: true,
      revalidateIfStale: true,
    },
  );

  return {
    conversationDetails: data,
    isLoading,
    isError: error,
    refreshDetails: mutate,
  };
}
