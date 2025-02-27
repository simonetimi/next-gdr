"use client";

import { OffGameChatContext } from "@/contexts/OffGameChatContext";
import { OnGameChatContext } from "@/contexts/OnGameChatContext";

export default function NewConversation({
  chatContext,
}: {
  chatContext: OffGameChatContext | OnGameChatContext;
}) {
  // TODO logic for new chat

  // TODO when starting a new chat, send the details (use context to send them)

  return null;
}
