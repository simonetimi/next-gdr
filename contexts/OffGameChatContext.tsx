import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

export type OffGameChatContext = {
  navigateToConversations: () => void;
  navigateToEditor: (conversationId: string | null) => void;
  navigateToNewChat: () => void;
  setNewConversationParticipants: Dispatch<SetStateAction<null>>;
  newConversationParticipants: null;
  currentConversationId: string | null;
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

  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);

  // TODO specify types for participants
  const [newConversationParticipants, setNewConversationParticipants] =
    useState(null);

  const navigateToConversations = () => {
    setComponentInView("conversations");
    setCurrentConversationId(null);
  };

  const navigateToEditor = (conversationId: string | null) => {
    setCurrentConversationId(conversationId);
    setComponentInView("editor");
  };

  const navigateToNewChat = () => {
    setComponentInView("newChat");
    setCurrentConversationId(null);
  };

  return (
    <OffGameChatContext.Provider
      value={{
        navigateToConversations,
        navigateToEditor,
        navigateToNewChat,
        setNewConversationParticipants,
        newConversationParticipants,
        currentConversationId,
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
