"use client";

import { ScrollShadow, Avatar, Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useOffGameConversations } from "@/hooks/useOffGameConversations";
import { GameConfig } from "@/utils/config/GameConfig";
import { formatTimeHoursMinutes } from "@/utils/dates";
import { type OffGameConversationWithDetails } from "@/models/offGameChat";

export default function OffGameChat() {
  const t = useTranslations();
  const { conversations } = useOffGameConversations();

  const sortedConversations = conversations?.toSorted(
    (a, b) =>
      (b.lastMessageAt?.getTime() ?? 0) - (a.lastMessageAt?.getTime() ?? 0),
  );

  return (
    <section className="flex h-full w-full flex-col">
      <ScrollShadow className="h-[calc(100%-2rem)] w-full">
        <div className="flex w-full flex-col">
          {sortedConversations?.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
            />
          ))}
        </div>
      </ScrollShadow>
    </section>
  );
}

interface ConversationItemProps {
  conversation: OffGameConversationWithDetails;
}

const ConversationItem = ({ conversation }: ConversationItemProps) => {
  const locale = GameConfig.getLocale();

  return (
    <Button
      className="flex w-full items-center gap-6 px-4 py-8 hover:bg-default-100 dark:hover:bg-default-800"
      variant="light"
    >
      <ParticipantsAvatars participants={conversation.participants} />
      <ConversationDetails conversation={conversation} />
      <TimeStamp date={conversation.lastMessageAt} locale={locale} />
    </Button>
  );
};

interface ParticipantsAvatarsProps {
  participants: OffGameConversationWithDetails["participants"];
}

const ParticipantsAvatars = ({ participants }: ParticipantsAvatarsProps) => (
  <div className="flex -space-x-3">
    {participants.map((participant) => (
      <Avatar
        key={participant.id}
        src={participant.miniAvatarUrl ?? ""}
        name={participant.firstName}
        className="h-8 w-8 border-2 border-background"
      />
    ))}
  </div>
);

const ConversationDetails = ({ conversation }: ConversationItemProps) => (
  <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
    <span className="w-full truncate text-sm font-medium">
      {conversation.isGroup
        ? conversation.name
        : conversation.participants.map((p) => p.firstName).join(", ")}
    </span>
    {conversation.lastMessage && (
      <span className="w-full truncate text-xs text-default-500">
        {conversation.lastMessage.content}
      </span>
    )}
  </div>
);

const TimeStamp = ({ date, locale }: { date: Date | null; locale: string }) => (
  <span className="whitespace-nowrap text-xs text-default-400">
    {date ? formatTimeHoursMinutes(date, locale) : ""}
  </span>
);
