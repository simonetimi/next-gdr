"use client";

import {
  OffGameConversation,
  OffGameConversationWithDetails,
} from "@/models/offGameChat";
import { GameConfig } from "@/utils/config/GameConfig";
import { addToast, Avatar } from "@heroui/react";
import { formatDateTime } from "@/utils/dates";
import { Markup } from "interweave";
import { Tooltip } from "@heroui/tooltip";
import { Button } from "@heroui/button";
import { Trash2 } from "lucide-react";
import { deleteOffGameConversationForParticipant } from "@/server/actions/offGameChat";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { shortenText, stripTags } from "@/utils/strings";
import { useMediaQuery } from "@uidotdev/usehooks";

interface ConversationProps {
  conversation: OffGameConversationWithDetails;
  isMobile: boolean;
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

  const isMobile = useMediaQuery("only screen and (max-width : 850px)");

  const { currentCharacter } = useGame();

  const [isDeleting, setIsDeleting] = useState(false);

  conversation.participants = conversation.participants.filter(
    (p) => p.firstName !== currentCharacter?.firstName,
  );

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
    <div className="flex w-full items-center py-1 lg:gap-4 lg:px-2">
      {conversation.unreadCount > 0 ? (
        <Tooltip content={t("components.gameChat.newMessages")}>
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
        className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl px-3 py-3 transition hover:cursor-pointer hover:bg-default-100 active:translate-y-1 dark:hover:bg-default-100"
      >
        <div>
          <ParticipantsAvatars participants={conversation.participants} />
        </div>
        <div className="min-w-0">
          <ConversationDetails
            conversation={conversation}
            isMobile={isMobile}
          />
        </div>
        <div className="flex w-20 flex-col items-end gap-1 text-right">
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

export const ParticipantsAvatars = ({ participants }: ParticipantsProps) => {
  const maxAvatarsShown = 4;

  return (
    <div className="w-20">
      <div className="flex -space-x-3">
        {participants.slice(0, maxAvatarsShown).map((participant) => (
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
};

const ConversationDetails = ({ conversation, isMobile }: ConversationProps) => {
  const maxPreviewLength = isMobile ? 15 : 30;
  return (
    <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
      <span className="w-full truncate text-sm font-medium">
        {conversation.isGroup
          ? shortenText(conversation.name ?? "", maxPreviewLength)
          : conversation.participants.map((p) => p.firstName)}
      </span>
      {conversation.lastMessage && (
        <Markup
          className="w-full truncate text-xs text-default-500"
          content={stripTags(
            shortenText(conversation.lastMessage.content, maxPreviewLength),
          )}
          allowList={[]}
        />
      )}
    </div>
  );
};

const TimeStamp = ({ date, locale }: { date: Date | null; locale: string }) => {
  if (!date)
    return <span className="whitespace-nowrap text-xs text-default-400"></span>;

  const { formattedDate, formattedTime, isToday } = formatDateTime(
    date,
    locale,
  );

  return (
    <div className="flex flex-col items-end text-xs text-default-400">
      <span className="whitespace-nowrap">{formattedTime}</span>
      {!isToday && <span className="whitespace-nowrap">{formattedDate}</span>}
    </div>
  );
};
