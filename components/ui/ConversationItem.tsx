"use client";

import type { OffGameConversationWithDetails } from "@/models/offGameChat";
import { GameConfig } from "@/utils/config/GameConfig";
import { Avatar } from "@heroui/react";
import { formatTimeHoursMinutes } from "@/utils/dates";

interface ConversationProps {
  conversation: OffGameConversationWithDetails;
}
interface ParticipantsProps {
  participants: OffGameConversationWithDetails["participants"];
}

export const ConversationItem = ({
  conversation,
  navigateToEditor,
}: {
  conversation: OffGameConversationWithDetails;
  navigateToEditor: (conversationId: string | null) => void;
}) => {
  const locale = GameConfig.getLocale();

  return (
    <button
      onClick={() => navigateToEditor(conversation.id)}
      className="flex w-full items-center gap-4 rounded-2xl px-4 py-5 transition hover:cursor-pointer hover:bg-default-100 active:translate-y-1 dark:hover:bg-default-800"
    >
      <div className="flex-shrink-0">
        <ParticipantsAvatars participants={conversation.participants} />
      </div>
      <div className="min-w-0 flex-grow">
        <ConversationDetails conversation={conversation} />
      </div>
      <div className="flex-shrink-0">
        <TimeStamp date={conversation.lastMessageAt} locale={locale} />
      </div>
    </button>
  );
};

// limit avatars to  4
export const ParticipantsAvatars = ({ participants }: ParticipantsProps) => (
  <div className="w-20">
    <div className="flex -space-x-3">
      {participants.slice(0, 4).map((participant) => (
        <Avatar
          key={participant.id}
          src={participant.miniAvatarUrl ?? ""}
          name={participant.firstName}
          className="h-8 w-8 border-2 border-background"
        />
      ))}
      {participants.length > 4 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-default-100 text-xs">
          +{participants.length - 4}
        </div>
      )}
    </div>
  </div>
);

const ConversationDetails = ({ conversation }: ConversationProps) => (
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
