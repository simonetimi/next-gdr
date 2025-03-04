import { createContext, ReactNode, useContext, useState } from "react";
import { MinimalCharacter } from "@/models/characters";
import { useUserSettings } from "@/hooks/swr/useUserSettings";
import { UserSettingsMinimal } from "@/models/userSettings";
import { defaultUserSettings } from "@/utils/constants/defaultUserSettings";
import { useCurrentCharacter } from "@/hooks/swr/useCurrentCharacter";

type GameContextType = {
  openCharacterSheets: Set<string>;
  toggleCharacterSheet: (characterId: string) => void;
  closeAllCharacterSheets: () => void;
  currentCharacter?: MinimalCharacter;
  userSettings: UserSettingsMinimal;
  refreshUserSettings: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  // current character
  const { currentCharacter } = useCurrentCharacter();

  // character sheets movable
  const [openCharacterSheets, setOpenCharacterSheets] = useState<Set<string>>(
    new Set(),
  );

  const toggleCharacterSheet = (characterId: string) => {
    setOpenCharacterSheets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(characterId)) {
        newSet.delete(characterId);
      } else {
        newSet.add(characterId);
      }
      return newSet;
    });
  };

  const closeAllCharacterSheets = () => {
    setOpenCharacterSheets(new Set());
  };

  // user settings
  const { userSettings: fetchedSettings, refreshUserSettings } =
    useUserSettings();
  const userSettings = fetchedSettings ?? defaultUserSettings;

  return (
    <GameContext.Provider
      value={{
        openCharacterSheets,
        toggleCharacterSheet,
        closeAllCharacterSheets,
        currentCharacter,
        userSettings,
        refreshUserSettings,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
