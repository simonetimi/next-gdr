"use client";

import ChatEditor from "@/components/game/messaging/ChatEditor";
import NewConversation from "@/components/game/messaging/NewConversation";
import ChatConversations from "@/components/game/messaging/ChatConversations";
import { useOffGameChat } from "@/contexts/OffGameChatContext";
import GroupChatSettings from "@/components/game/messaging/GroupChatSettings";

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

  if (offGameChat.componentInView === "groupChatSettings") {
    return <GroupChatSettings chatContext={offGameChat} />;
  }
}
