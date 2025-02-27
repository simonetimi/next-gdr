"use client";

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
  // TODO logic for editing chat
  return <div></div>;
}
