"use client";

import type { OffGameConversationWithDetails } from "@/models/offGameChat";
import { GameConfig } from "@/utils/config/GameConfig";
import { Avatar, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { formatTimeHoursMinutes } from "@/utils/dates";
import { Markup } from "interweave";

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

  // TODO translations

  return (
    <button
      onClick={() => navigateToEditor(conversation.id)}
      className="flex w-full items-center gap-4 rounded-2xl px-4 py-5 transition hover:cursor-pointer hover:bg-default-100 active:translate-y-1 dark:hover:bg-default-800"
    >
      <Popover>
        <PopoverTrigger>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
          </span>
        </PopoverTrigger>
        <PopoverContent>
          <span>New messages</span>
        </PopoverContent>
      </Popover>
      <div className="flex-shrink-0">
        <ParticipantsAvatars participants={conversation.participants} />
      </div>
      <div className="mr-7 min-w-0 flex-grow">
        <ConversationDetails conversation={conversation} />
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <TimeStamp date={conversation.lastMessageAt} locale={locale} />
      </div>
    </button>
  );
};

// limit avatars to 4
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
      <Markup
        className="w-full truncate text-xs text-default-500"
        content={
          conversation.lastMessage.content.length > 20
            ? conversation.lastMessage.content.slice(0, 15) + "..."
            : conversation.lastMessage.content
        }
        allowList={[]}
      />
    )}
  </div>
);

const TimeStamp = ({ date, locale }: { date: Date | null; locale: string }) => {
  return (
    <span className="whitespace-nowrap text-xs text-default-400">
      {date ? formatTimeHoursMinutes(date, locale) : ""}
    </span>
  );
};
