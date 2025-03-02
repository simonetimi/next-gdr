"use client";

import {
  OffGameConversation,
  OffGameConversationWithDetails,
} from "@/models/offGameChat";
import { GameConfig } from "@/utils/config/GameConfig";
import { addToast, Avatar } from "@heroui/react";
import { formatTimeHoursMinutes } from "@/utils/dates";
import { Markup } from "interweave";
import { Tooltip } from "@heroui/tooltip";
import { Button } from "@heroui/button";
import { Trash2 } from "lucide-react";
import { deleteOffGameConversationForParticipant } from "@/server/actions/offGameChat";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useGame } from "@/contexts/GameContext";

interface ConversationProps {
  conversation: OffGameConversationWithDetails;
}
interface ParticipantsProps {
  participants: OffGameConversationWithDetails["participants"];
}

export const ConversationItem = ({
  conversation,
  navigateToEditor,
  refreshConversations,
}: {
  conversation: OffGameConversationWithDetails;
  navigateToEditor: (conversation: OffGameConversation) => void;
  refreshConversations: () => void;
}) => {
  const locale = GameConfig.getLocale();
  const t = useTranslations();

  const { currentCharacter } = useGame();

  const [isDeleting, setIsDeleting] = useState(false);

  conversation.participants = conversation.isGroup
    ? conversation.participants
    : conversation.participants.filter(
        (p) => p.firstName !== currentCharacter?.firstName,
      );

  // TODO translations

  const handleDeletion = async () => {
    try {
      if (isDeleting) return;
      await deleteOffGameConversationForParticipant(conversation.id);
      refreshConversations();
      addToast({
        title: t("components.gameChat.conversationRemoved"),
        color: "success",
      });
    } catch (error) {
      let errorMessage = t("errors.generic");
      if (error instanceof Error) errorMessage = error.message;
      addToast({
        title: t("errors.title"),
        description: errorMessage,
        color: "danger",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex w-full items-center gap-4 px-2 py-1">
      {conversation.unreadCount > 0 ? (
        <Tooltip content="New messages">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500"></span>
          </span>
        </Tooltip>
      ) : (
        <span className="relative flex h-2 w-2"></span>
      )}
      <button
        onClick={() => navigateToEditor(conversation)}
        className="flex w-full items-center gap-4 rounded-2xl px-3 py-3 transition hover:cursor-pointer hover:bg-default-100 active:translate-y-1 dark:hover:bg-default-800"
      >
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
      <Button
        isIconOnly
        startContent={<Trash2 className="h-4 w-4" />}
        size="sm"
        variant="light"
        color="danger"
        onPress={handleDeletion}
        isLoading={isDeleting}
        className="cursor-pointer"
      />
    </div>
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
          className="h-8 w-8"
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
          conversation.lastMessage.content.length > 40
            ? conversation.lastMessage.content.slice(0, 37) + "..."
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
