import { createPortal } from "react-dom";
import Movable from "@/components/ui/Movable";
import OnlineUsers from "@/components/game/OnlineUsers";
import { usePortalRoot } from "@/hooks/usePortalRoot";
import { Dispatch, SetStateAction } from "react";
import { useWindowSize } from "@uidotdev/usehooks";

export default function OnlineCharactersPortal({
  isSmallScreen,
  show,
  setShow,
}: {
  isSmallScreen: boolean;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  const portalRef = usePortalRoot();

  const windowSize = useWindowSize();

  const modalWidth = isSmallScreen ? windowSize.width! : 1000;
  const modalHeight = isSmallScreen ? windowSize.height! : 600;

  const centerX = Math.max(0, (windowSize.width! - modalWidth) / 2);
  const centerY = Math.max(0, (windowSize.height! - modalHeight) / 2);

  return (
    <>
      {show &&
        portalRef.current &&
        createPortal(
          <Movable
            boundsSelector="body"
            dragHandleClassName="handle"
            component={<OnlineUsers />}
            coords={[centerX, centerY]}
            width={modalWidth}
            height={modalHeight}
            minWidth={modalWidth - 100}
            minHeight={modalHeight - 50}
            showSetter={setShow}
            enableResizing={!isSmallScreen}
            enableMovement={!isSmallScreen}
            componentName="onlineCharacters"
          />,
          portalRef.current,
        )}
    </>
  );
}
