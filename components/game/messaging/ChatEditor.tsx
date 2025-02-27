"use client";

import { useState } from "react";
import { Button, ScrollShadow } from "@heroui/react";
import { useTranslations } from "next-intl";
import Editor from "@/components/editor/Editor";
import { ArrowLeftIcon, Send } from "lucide-react";

interface ChatEditorProps {
  type: "on" | "off";
  conversationId: string | null;
  navigateToConversations: () => void;
}

export default function ChatEditor({
  type,
  conversationId,
  navigateToConversations,
}: ChatEditorProps) {
  const t = useTranslations();
  const [message, setMessage] = useState("");

  return (
    <div className="flex h-full flex-col lg:h-[90%]">
      <header className="flex items-center gap-4 p-4">
        <Button isIconOnly variant="light" onPress={navigateToConversations}>
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
