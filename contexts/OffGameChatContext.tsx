import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { OffGameConversation } from "@/models/offGameChat";

type ComponentInView =
  | "conversations"
  | "editor"
  | "newChat"
  | "groupChatSettings";

export type OffGameChatContext = {
  navigateToConversations: () => void;
  navigateToEditor: (conversation: OffGameConversation | null) => void;
  navigateToNewChat: () => void;
  navigateToGroupChatSettings: () => void;
  currentConversation: OffGameConversation | null;
  componentInView: ComponentInView;
  type: "off";
  setComponentInView: Dispatch<SetStateAction<ComponentInView>>;
};

const OffGameChatContext = createContext<OffGameChatContext | undefined>(
  undefined,
);

export function OffGameChatProvider({ children }: { children: ReactNode }) {
  const [componentInView, setComponentInView] =
    useState<ComponentInView>("conversations");

  const [currentConversation, setCurrentConversation] =
    useState<OffGameConversation | null>(null);

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

  const navigateToGroupChatSettings = () => {
    setComponentInView("groupChatSettings");
  };

  return (
    <OffGameChatContext.Provider
      value={{
        navigateToConversations,
        navigateToEditor,
        navigateToNewChat: navigateToNewConversation,
        navigateToGroupChatSettings,
        currentConversation,
        componentInView,
        type: "off",
        setComponentInView,
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
