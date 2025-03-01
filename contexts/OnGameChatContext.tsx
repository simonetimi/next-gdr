import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

export type OnGameChatContext = {
  navigateToConversations: () => void;
  navigateToEditor: (conversationId: string | null) => void;
  navigateToNewChat: () => void;
  setNewConversationParticipants: Dispatch<SetStateAction<null>>;
  newConversationParticipants: null;
  currentConversationId: string | null;
  componentInView: "conversations" | "editor" | "newChat";
  type: "on";
};

const OnGameChatContext = createContext<OnGameChatContext | undefined>(
  undefined,
);

export function OnGameChatProvider({ children }: { children: ReactNode }) {
  const [componentInView, setComponentInView] = useState<
    "conversations" | "editor" | "newChat"
  >("conversations");

  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);

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
    <OnGameChatContext.Provider
      value={{
        navigateToConversations,
        navigateToEditor,
        navigateToNewChat,
        setNewConversationParticipants,
        newConversationParticipants,
        currentConversationId,
        componentInView,
        type: "on",
      }}
    >
      {children}
    </OnGameChatContext.Provider>
  );
}

export const useOffGameChat = () => {
  const context = useContext(OnGameChatContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
