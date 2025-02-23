import { createContext, ReactNode, useContext, useState } from "react";
import { MinimalCharacter } from "@/models/characters";

type GameContextType = {
  openCharacterSheets: Set<string>;
  toggleCharacterSheet: (characterId: string) => void;
  closeAllCharacterSheets: () => void;
  currentCharacter?: MinimalCharacter;
  setCurrentCharacter: (character: MinimalCharacter) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  // current character
  const [currentCharacter, setCurrentCharacter] = useState<MinimalCharacter>();

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

  return (
    <GameContext.Provider
      value={{
        openCharacterSheets,
        toggleCharacterSheet,
        closeAllCharacterSheets,
        currentCharacter,
        setCurrentCharacter,
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
