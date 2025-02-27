"use client";

import { useLayoutEffect, useRef, useState } from "react";
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

  // in alternative flex-column is enough. this only adds some animation
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    //  small delay to ensure content is rendered
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 10);
  }, []);

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

      <ScrollShadow
        visibility="top"
        className="min-h-0 flex-1 flex-col overflow-y-auto p-2"
      >
        <div className="h-6">Prova</div>
        <div className="h-6">Prova</div>
        <div className="h-6">Prova</div>
        <div className="h-6">Prova</div> <div className="h-6">Prova</div>
        <div className="h-6">Prova</div>
        <div className="h-6">Prova</div>
        <div className="h-6">Prova</div> <div className="h-6">Prova</div>
        <div className="h-6">Prova</div>
        <div className="h-6">Prova</div>
        <div className="h-6">Prova</div> <div className="h-6">Prova</div>
        <div className="h-6">Prova</div>
        <div className="h-6">Prova</div>
        <div className="h-6">Prova</div>
        <div ref={bottomRef} className="mt-auto h-1" />
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
