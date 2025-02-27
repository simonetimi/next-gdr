"use client";

import { useState } from "react";
import { Button, ScrollShadow } from "@heroui/react";
import { useTranslations } from "next-intl";
import Editor from "@/components/editor/Editor";
import { ArrowLeftIcon, Send } from "lucide-react";
import { OffGameChatContext } from "@/contexts/OffGameChatContext";
import { OnGameChatContext } from "@/contexts/OnGameChatContext";

export default function ChatEditor({
  chatContext,
}: {
  chatContext: OffGameChatContext | OnGameChatContext;
}) {
  const t = useTranslations();

  // fetch with swr
  const [message, setMessage] = useState("");

  // TODO logic to send message and fetch periodically messages -> make swr + server action
  //  imp! if it's the first message of the conversation, it should also create the conversation.
  //  (cae -> conversation id is null)

  // TODO find a way to make texts appear one on the left and one on the right, little bubbles

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
        <h2 className="font-semibold">Conversation Title</h2>
      </header>

      <ScrollShadow className="min-h-0 flex-1 overflow-y-auto p-2">
        <p>Content</p> <p>Content</p> <p>Content</p>
        <p>Content</p> <p>Content</p> <p>Content</p>
        <p>Content</p> <p>Content</p> <p>Content</p>
        <p>Content</p> <p>Content</p> <p>Content</p>
        <p>Content</p> <p>Content</p> <p>Content</p>
      </ScrollShadow>

      <div className="flex items-end gap-2 p-2">
        <Editor
          content={message}
          onContentChange={setMessage}
          containerClass="flex-1"
          editorClass="h-[100px]"
        />
        <Button
          isIconOnly
          startContent={<Send className="h-5 w-5" />}
          color="primary"
          size="sm"
          className="mb-0.5"
          isDisabled={!message.trim()}
          onPress={() => {
            setMessage("");
          }}
        />
      </div>
    </div>
  );
}
