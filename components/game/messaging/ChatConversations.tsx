"use client";

import { ScrollShadow, Spinner } from "@heroui/react";
import { useTranslations } from "next-intl";
import { ConversationItem } from "@/components/ui/ConversationItem";
import { useConversations } from "@/hooks/swr/useConversations";
import { OffGameChatContext } from "@/contexts/OffGameChatContext";
import { MailPlus } from "lucide-react";
import { Button } from "@heroui/button";

export default function ChatConversations({
  chatContext,
}: {
  chatContext: OffGameChatContext;
}) {
  // TODO translations
  const t = useTranslations();

  const { conversations, isLoading, refreshConversations } = useConversations(
    chatContext.type,
  );

  const sortedConversations =
    conversations &&
    conversations?.toSorted(
      (a, b) =>
        new Date(b.lastMessageAt ?? "").getTime() -
        (new Date(a.lastMessageAt ?? "").getTime() ?? 0),
    );

  return (
    <section className="flex h-full w-full flex-col gap-2">
      <div className="flex pl-4 pr-5">
        <Button
          isIconOnly
          startContent={<MailPlus className="h-5 w-5" />}
          color="primary"
          variant="flat"
          size="sm"
          onPress={() => chatContext.navigateToNewChat()}
        />
        {isLoading && <Spinner variant="wave" size="sm" className="ml-auto" />}
      </div>

      <ScrollShadow className="flex h-full w-full flex-col">
        {conversations?.length === 0 && (
          <div className="flex h-full items-center justify-center">
            {t("components.gameChat.noConversationFound")}
          </div>
        )}
        {sortedConversations?.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            navigateToEditor={chatContext.navigateToEditor}
            refreshConversations={refreshConversations}
          />
        ))}
      </ScrollShadow>
    </section>
  );
}
