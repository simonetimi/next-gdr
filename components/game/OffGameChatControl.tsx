"use client";

import ChatEditor from "@/components/game/messaging/ChatEditor";
import NewConversation from "@/components/game/messaging/NewConversation";
import ChatConversations from "@/components/game/messaging/ChatConversations";
import { useOffGameChat } from "@/contexts/OffGameChatContext";
import GroupChatSettings from "@/components/game/messaging/GroupChatSettings";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

export function OffGameChatControl() {
  const offGameChat = useOffGameChat();
  const { setComponentInView } = offGameChat;

  // reset to conversations list when component  is closed
  useEffect(() => {
    // timeout to bypass strict mode (dev only)
    let isMountedLongEnough = false;
    const timer = setTimeout(() => {
      isMountedLongEnough = true;
    }, 10);

    return () => {
      clearTimeout(timer);
      if (isMountedLongEnough) {
        setComponentInView("conversations");
      }
    };
  }, [setComponentInView]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={offGameChat.componentInView}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="h-full"
      >
        {offGameChat.componentInView === "editor" && (
          <ChatEditor chatContext={offGameChat} />
        )}
        {offGameChat.componentInView === "newChat" && (
          <NewConversation chatContext={offGameChat} />
        )}
        {offGameChat.componentInView === "conversations" && (
          <ChatConversations chatContext={offGameChat} />
        )}
        {offGameChat.componentInView === "groupChatSettings" && (
          <GroupChatSettings chatContext={offGameChat} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
