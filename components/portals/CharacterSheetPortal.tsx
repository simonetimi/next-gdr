import { useGame } from "@/contexts/GameContext";
import { createPortal } from "react-dom";
import Movable from "@/components/ui/Movable";
import CharacterSheet from "@/components/game/CharacterSheet";
import { usePortalRoot } from "@/hooks/usePortalRoot";

export default function CharacterSheetPortal({
  isSmallDevice,
}: {
  isSmallDevice: boolean;
}) {
  const game = useGame();
  const portalRef = usePortalRoot();

  return (
    <>
      {Array.from(game.openCharacterSheets).map(
        (characterId) =>
          portalRef.current &&
          createPortal(
            <Movable
              key={characterId}
              boundsSelector="body"
              dragHandleClassName="handle"
              component={<CharacterSheet characterId={characterId} />}
              coords={isSmallDevice ? [0, 140] : [0, 110]}
              width={isSmallDevice ? "100vw" : 1000}
              minWidth={isSmallDevice ? "100vw" : 800}
              minHeight={isSmallDevice ? "calc(99vh - 140px)" : 550}
              height={isSmallDevice ? "calc(99vh - 140px)" : 600}
              showSetter={(show) => {
                if (!show) {
                  game.toggleCharacterSheet(characterId);
                }
              }}
              enableResizing={!isSmallDevice}
              enableMovement={!isSmallDevice}
              componentName="characterSheet"
            />,
            portalRef.current,
          ),
      )}
    </>
  );
}
