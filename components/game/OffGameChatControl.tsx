"use client";

import { useState } from "react";
import ChatEditor from "@/components/game/messaging/ChatEditor";
import NewConversation from "@/components/game/messaging/NewConversation";
import ChatConversations from "@/components/game/messaging/ChatConversations";

export function OffGameChatControl() {
  const [componentInView, setComponentInView] = useState<
    "conversations" | "editor" | "newChat"
  >("conversations");

  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);

  const navigateToConversations = () => {
    setComponentInView("conversations");
    setCurrentConversationId(null);
  };

  const navigateToEditor = (conversationId: string) => {
    console.log("hello!");
    setCurrentConversationId(conversationId);
    setComponentInView("editor");
  };

  const navigateToNewChat = () => {
    setComponentInView("newChat");
    setCurrentConversationId(null);
  };

  if (componentInView === "editor") {
    return (
      <ChatEditor
        type="off"
        conversationId={currentConversationId}
        navigateToConversations={navigateToConversations}
      />
    );
  }

  if (componentInView === "newChat") {
    return (
      <NewConversation
        type="off"
        navigateToConversations={navigateToConversations}
        navigateToEditor={navigateToEditor}
      />
    );
  }

  if (componentInView === "conversations") {
    return (
      <ChatConversations
        type="off"
        navigateToEditor={navigateToEditor}
        navigateToNewChat={navigateToNewChat}
      />
    );
  }
}
