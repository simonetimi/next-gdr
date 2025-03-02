"use client";

import { useRef, useState, useEffect, Ref } from "react";
import {
  addToast,
  Button,
  ScrollShadow,
  Avatar,
  Spinner,
  Tooltip,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import Editor from "@/components/editor/Editor";
import { ArrowLeftIcon, Check, Send, UserCog } from "lucide-react";
import { OffGameChatContext } from "@/contexts/OffGameChatContext";
import { useChatMessagesInfinite } from "@/hooks/swr/useChatMessagesInfinite";
import { sendOffGameMessage } from "@/server/actions/offGameChat";
import { useGame } from "@/contexts/GameContext";
import { useConversationDetails } from "@/hooks/swr/useConversationDetails";
import { Markup } from "interweave";
import { formatDateTime } from "@/utils/dates";
import { GameConfig } from "@/utils/config/GameConfig";
import { OffGameMessageWithReads } from "@/models/offGameChat";

export default function ChatEditor({
  chatContext,
}: {
  chatContext: OffGameChatContext;
}) {
  const t = useTranslations();
  const { currentCharacter, toggleCharacterSheet } = useGame();
  const locale = GameConfig.getLocale();

  const {
    messages,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    loadMore,
    refreshMessages,
  } = useChatMessagesInfinite(
    chatContext.type,
    chatContext.currentConversation?.id ?? "",
  );
  const { conversationDetails } = useConversationDetails(
    chatContext.type,
    chatContext.currentConversation?.id ?? "",
  );

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const [hasInitialScroll, setHasInitialScroll] = useState(false);
  const hasClickedConversationSettings = useRef(false);

  const editorRef = useRef<{ clearContent: () => void }>(null);

  const handleClearContent = () => {
    if (editorRef.current) {
      editorRef.current.clearContent();
    }
  };

  const handleOnSubmit = async () => {
    if (!message.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await sendOffGameMessage(
        chatContext.currentConversation?.id ?? "",
        message,
      );
      handleClearContent();
      setMessage("");
      await refreshMessages();
      setTimeout(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      let errorMessage = t("errors.generic");
      if (error instanceof Error) errorMessage = error.message;
      addToast({
        title: t("errors.title"),
        description: errorMessage,
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScroll = () => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !hasInitialScroll) return;

    if (scrollContainer.scrollTop <= 100 && !isLoadingMore && !isReachingEnd) {
      loadMore();
    }
  };

  // first scroll into view when messages are loaded the first time
  useEffect(() => {
    if (!hasInitialScroll && messages?.length) {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => setHasInitialScroll(true), 1000);
    }
  }, [messages, hasInitialScroll]);

  // reset the movable to the conversation lists when the user closes it
  useEffect(() => {
    // set a flag to track if we've been mounted long enough
    let isMountedLongEnough = false;

    // timeout delay to get past React's strict mode double mount (development only)
    const timer = setTimeout(() => {
      isMountedLongEnough = true;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (isMountedLongEnough && !hasClickedConversationSettings.current) {
        chatContext.navigateToConversations();
      }
    };
  }, [chatContext]);

  const isGroup = conversationDetails?.isGroup;
  const participants = conversationDetails?.participants || [];
  const otherParticipant = participants.find((p) => !p.isCurrentUser);
  const conversationTitle = isGroup
    ? conversationDetails?.name
    : otherParticipant?.name;

  const participantsMap = participants.reduce(
    (acc, p) => {
      acc[p.id] = p;
      return acc;
    },
    {} as Record<string, (typeof participants)[0]>,
  );

  return (
    <div className="flex h-full flex-col lg:h-[90%]">
      <header className="flex items-center gap-4 p-4">
        <Button
          isIconOnly
          variant="light"
          onPress={chatContext.navigateToConversations}
        >
          <ArrowLeftIcon />
        </Button>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-default-200"></div>
          ) : isGroup ? (
            <div className="relative h-8 w-8">
              {participants
                .filter((p) => !p.isRemoved && !p.isCurrentUser)
                .slice(0, 2)
                .map((participant, i) => (
                  <Avatar
                    key={participant.id}
                    src={participant.avatarUrl || undefined}
                    name={participant.name?.[0] || "?"}
                    className={`absolute ${i === 0 ? "left-0 top-0" : "bottom-0 right-0"} h-6 w-6`}
                    showFallback
                    size="sm"
                  />
                ))}
            </div>
          ) : (
            <Avatar
              src={otherParticipant?.avatarUrl || undefined}
              name={(otherParticipant?.name?.[0] || "?").toUpperCase()}
              className="h-8 w-8"
              showFallback
            />
          )}
          <h2 className="font-semibold">{conversationTitle}</h2>
        </div>
        {isGroup && conversationDetails?.adminId === currentCharacter?.id && (
          <Button
            isIconOnly
            variant="light"
            onPress={() => {
              hasClickedConversationSettings.current = true;
              chatContext.navigateToGroupChatSettings();
            }}
            aria-label={t("components.gameChat.settings.title")}
          >
            <UserCog className="h-5 w-5" />
          </Button>
        )}
      </header>

      <ScrollShadow
        ref={scrollContainerRef}
        visibility="top"
        className="min-h-0 flex-1 flex-col overflow-y-auto p-4"
        onScroll={handleScroll}
      >
        {isReachingEnd && messages && messages.length > 0 && (
          <div className="py-2 text-center text-xs text-default-400">
            No more messages
          </div>
        )}

        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <Spinner variant="dots" />
          </div>
        )}

        {messages && messages.length > 0 && (
          <div className="flex flex-col-reverse gap-3">
            {messages.map((message, index) => {
              const isCurrentUser = message.senderId === currentCharacter?.id;
              const sender = participantsMap[message.senderId ?? ""];

              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isCurrentUser={isCurrentUser}
                  isGroup={isGroup}
                  sender={sender}
                  currentCharacterId={currentCharacter?.id}
                  locale={locale}
                  ref={index === 0 ? lastMessageRef : null}
                  onOpenCharacterSheet={toggleCharacterSheet}
                />
              );
            })}
          </div>
        )}

        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        )}
      </ScrollShadow>

      <div className="flex items-end gap-2 p-2">
        <Editor
          content={message}
          onContentChange={setMessage}
          containerClass="flex-1"
          editorClass="h-[100px]"
          editorRef={editorRef}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && !e.shiftKey && message.trim()) {
              await handleOnSubmit();
            }
          }}
        />
        <Button
          isIconOnly
          startContent={isSubmitting ? null : <Send className="h-5 w-5" />}
          color="primary"
          size="sm"
          className="mb-0.5"
          isLoading={isSubmitting}
          isDisabled={!message.trim()}
          onPress={handleOnSubmit}
        />
      </div>
    </div>
  );
}

const ChatMessage = ({
  message,
  isCurrentUser,
  isGroup,
  sender,
  currentCharacterId,
  locale,
  ref,
  onOpenCharacterSheet,
}: {
  message: OffGameMessageWithReads;
  isCurrentUser: boolean;
  isGroup?: boolean;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
    isCurrentUser: boolean;
    isRemoved?: boolean;
  };
  currentCharacterId?: string;
  locale: string;
  ref: Ref<HTMLDivElement>;
  onOpenCharacterSheet: (characterId: string) => void;
}) => {
  if (message.isSystem) {
    return (
      <div ref={ref} className="my-2 flex justify-center">
        <div className="text-xs text-default-400">
          <Markup content={message.content} />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`flex items-end gap-2 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {(!isCurrentUser || isGroup) && (
        <Tooltip content={sender.name}>
          <Avatar
            onClick={() => onOpenCharacterSheet(sender.id)}
            src={sender?.avatarUrl || undefined}
            name={sender?.name?.[0]}
            className={`h-6 w-6 cursor-pointer ${sender?.isRemoved ? "opacity-70" : ""}`}
            showFallback
            size="sm"
          />
        </Tooltip>
      )}

      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
          isCurrentUser
            ? "bg-primary-400 text-white"
            : "bg-default-200 dark:bg-default-100"
        }`}
      >
        <Markup content={message.content} />
        <div
          className={`mt-1 flex items-center gap-1 text-[10px] opacity-70 ${
            isCurrentUser ? "text-right" : "text-left"
          }`}
        >
          {formatDateTime(message.sentAt, locale)}
          {message.readers?.length > 0 &&
            (isGroup
              ? message.readers.some(
                  (reader) =>
                    reader.id !== currentCharacterId &&
                    reader.id !== message.senderId,
                )
              : isCurrentUser) && (
              <Tooltip
                content={
                  <div className="flex flex-col gap-1">
                    {isGroup ? (
                      <div className="flex flex-wrap gap-1">
                        Read by:
                        {Array.from(
                          new Map(
                            message.readers
                              .filter(
                                (reader) =>
                                  reader.id !== currentCharacterId &&
                                  reader.id !== message.senderId,
                              )
                              .map((reader) => [reader.id, reader]),
                          ).values(),
                        ).map((reader) => (
                          <div
                            key={reader.id}
                            className="flex items-center gap-1"
                          >
                            <Avatar
                              src={reader.miniAvatarUrl || undefined}
                              name={reader.firstName?.[0]}
                              className="h-4 w-4"
                              showFallback
                              size="sm"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs">
                        Read:{" "}
                        {message.readers[0]?.readAt &&
                          formatDateTime(message.readers[0].readAt, locale)}
                      </div>
                    )}
                  </div>
                }
              >
                <Check className="h-2 w-2" />
              </Tooltip>
            )}
        </div>
      </div>
    </div>
  );
};
