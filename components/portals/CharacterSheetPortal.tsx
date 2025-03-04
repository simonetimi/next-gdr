import { useGame } from "@/contexts/GameContext";
import { createPortal } from "react-dom";
import Movable from "@/components/ui/Movable";
import CharacterSheet from "@/components/game/CharacterSheet";
import { usePortalRoot } from "@/hooks/usePortalRoot";
import { useWindowSize } from "@uidotdev/usehooks";

export default function CharacterSheetPortal({
  isSmallScreen,
}: {
  isSmallScreen: boolean;
}) {
  const game = useGame();
  const portalRef = usePortalRoot();

  const windowSize = useWindowSize();

  const modalWidth = isSmallScreen ? windowSize.width! : 1000;
  const modalHeight = isSmallScreen ? windowSize.height! : 600;

  const centerX = Math.max(0, (windowSize.width! - modalWidth) / 2);
  const centerY = Math.max(0, (windowSize.height! - modalHeight) / 2);

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
              coords={[centerX, centerY]}
              width={modalWidth}
              height={modalHeight}
              minWidth={modalWidth - 100}
              minHeight={modalHeight - 50}
              showSetter={(show) => {
                if (!show) {
                  game.toggleCharacterSheet(characterId);
                }
              }}
              enableResizing={!isSmallScreen}
              enableMovement={!isSmallScreen}
              componentName="characterSheet"
            />,
            portalRef.current,
          ),
      )}
    </>
  );
}
