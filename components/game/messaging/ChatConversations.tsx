"use client";

import { ScrollShadow } from "@heroui/react";
import { useTranslations } from "next-intl";
import { ConversationItem } from "@/components/ui/ConversationItem";
import { useConversations } from "@/hooks/useConversations";
import { OffGameChatContext } from "@/contexts/OffGameChatContext";
import { OnGameChatContext } from "@/contexts/OnGameChatContext";

const mockConversations = [
  {
    id: "conv1",
    isGroup: false,
    name: null,
    imageUrl: null,
    createdAt: new Date("2024-03-10T10:00:00Z"),
    lastMessageAt: new Date("2024-03-10T14:30:00Z"),
    lastMessage: {
      content: "See you at the tavern then!",
      senderId: "char2",
    },
    participants: [
      {
        id: "char1",
        firstName: "Eldric",
        miniAvatarUrl: "/avatars/eldric-mini.jpg",
      },
      {
        id: "char2",
        firstName: "Lyra",
        miniAvatarUrl: "/avatars/lyra-mini.jpg",
      },
    ],
  },
  {
    id: "conv2",
    isGroup: true,
    name: "Adventure Party",
    imageUrl: "/groups/party.jpg",
    createdAt: new Date("2024-03-09T15:00:00Z"),
    lastMessageAt: new Date("2024-03-10T16:45:00Z"),
    lastMessage: {
      content: "Who's bringing the healing potions?",
      senderId: "char3",
    },
    participants: [
      {
        id: "char1",
        firstName: "Eldric",
        miniAvatarUrl: "/avatars/eldric-mini.jpg",
      },
      {
        id: "char2",
        firstName: "Lyra",
        miniAvatarUrl: "/avatars/lyra-mini.jpg",
      },
      {
        id: "char3",
        firstName: "Thorin",
        miniAvatarUrl: "/avatars/thorin-mini.jpg",
      },
    ],
  },
];

export default function CjatConversations({
  chatContext,
}: {
  chatContext: OffGameChatContext | OnGameChatContext;
}) {
  const t = useTranslations();

  const { conversations } = useConversations(chatContext.type);

  // TODO replace mock with actual values - type error will disappear
  const sortedConversations = mockConversations?.toSorted(
    (a, b) =>
      (b.lastMessageAt?.getTime() ?? 0) - (a.lastMessageAt?.getTime() ?? 0),
  );

  return (
    <section className="flex h-full w-full flex-col">
      <ScrollShadow className="flex h-full w-full flex-col">
        {sortedConversations?.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            navigateToEditor={chatContext.navigateToEditor}
          />
        ))}
      </ScrollShadow>
    </section>
  );
}
