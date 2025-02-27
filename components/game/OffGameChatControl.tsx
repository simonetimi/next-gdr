"use client";

import ChatEditor from "@/components/game/messaging/ChatEditor";
import NewConversation from "@/components/game/messaging/NewConversation";
import ChatConversations from "@/components/game/messaging/ChatConversations";
import { useOffGameChat } from "@/contexts/OffGameChatContext";

export function OffGameChatControl() {
  const offGameChat = useOffGameChat();

  if (offGameChat.componentInView === "editor") {
    return <ChatEditor chatContext={offGameChat} />;
  }

  if (offGameChat.componentInView === "newChat") {
    return <NewConversation chatContext={offGameChat} />;
  }

  if (offGameChat.componentInView === "conversations") {
    return <ChatConversations chatContext={offGameChat} />;
  }
}
