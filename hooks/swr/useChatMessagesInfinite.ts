import { useCallback } from "react";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "@/utils/swr";
import { OffGameMessageWithReads } from "@/models/offGameChat";

type MessagesResponse = OffGameMessageWithReads[];

export function useChatMessagesInfinite(
  chatType: "on" | "off",
  conversationId: string,
) {
  const getKey = useCallback(
    (pageIndex: number, previousPageData: MessagesResponse | null) => {
      // first page, no cursor needed
      if (pageIndex === 0) {
        return `/api/game/chat/${chatType}/messages/${conversationId}`;
      }

      // reached the end
      if (previousPageData && !previousPageData.length) return null;

      // get the cursor (id of the last item in previous page)
      const cursor = previousPageData?.[previousPageData.length - 1]?.id;
      if (!cursor) return null;

      // add the cursor to the API endpoint
      return `/api/game/chat/${chatType}/messages/${conversationId}?cursor=${cursor}`;
    },
    [chatType, conversationId],
  );

  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<MessagesResponse>(getKey, fetcher, {
      refreshInterval: 1000 * 15, // 15 seconds
      revalidateFirstPage: true,
      revalidateOnFocus: true,
    });

  // flatten all pages and deduplicate messages by id
  const messages = data
    ? Array.from(
        new Map(data.flat().map((message) => [message.id, message])).values(),
      )
    : [];

  const isLoadingMore =
    size > 0 && data && typeof data[size - 1] === "undefined";
  const isEmpty = data?.[0]?.length === 0;

  // check if the last page's actual length is less than the limit
  const isReachingEnd = isEmpty || (data && !data[data.length - 1]?.length);

  return {
    messages,
    error,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    isValidating,
    size,
    setSize,
    loadMore: () => !isReachingEnd && setSize(size + 1),
    refreshMessages: mutate,
  };
}
