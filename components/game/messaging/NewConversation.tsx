"use client";

interface NewConversationProps {
  type: "on" | "off";
  navigateToConversations: () => void;
  navigateToEditor: (chatId: string) => void;
}

export default function NewConversation({
  type,
  navigateToConversations,
  navigateToEditor,
}: NewConversationProps) {
  // TODO logic for new chat

  return null;
}
