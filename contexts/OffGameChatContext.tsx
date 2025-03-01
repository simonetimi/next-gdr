import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { OffGameConversation } from "@/models/offGameChat";

export type OffGameChatContext = {
  navigateToConversations: () => void;
  navigateToEditor: (conversation: OffGameConversation | null) => void;
  navigateToNewChat: () => void;
  setNewConversationParticipants: Dispatch<SetStateAction<null>>;
  newConversationParticipants: null;
  currentConversation: OffGameConversation | null;
  componentInView: "conversations" | "editor" | "newChat";
  type: "off";
};

const OffGameChatContext = createContext<OffGameChatContext | undefined>(
  undefined,
);

export function OffGameChatProvider({ children }: { children: ReactNode }) {
  const [componentInView, setComponentInView] = useState<
    "conversations" | "editor" | "newChat"
  >("conversations");

  const [currentConversation, setCurrentConversation] =
    useState<OffGameConversation | null>(null);

  const [newConversationParticipants, setNewConversationParticipants] =
    useState(null);

  const navigateToConversations = () => {
    setComponentInView("conversations");
    setCurrentConversation(null);
  };

  const navigateToEditor = (conversation: OffGameConversation | null) => {
    setCurrentConversation(conversation);
    setComponentInView("editor");
  };

  const navigateToNewConversation = () => {
    setComponentInView("newChat");
    setCurrentConversation(null);
  };

  return (
    <OffGameChatContext.Provider
      value={{
        navigateToConversations,
        navigateToEditor,
        navigateToNewChat: navigateToNewConversation,
        setNewConversationParticipants,
        newConversationParticipants,
        currentConversation,
        componentInView,
        type: "off",
      }}
    >
      {children}
    </OffGameChatContext.Provider>
  );
}

export const useOffGameChat = () => {
  const context = useContext(OffGameChatContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
