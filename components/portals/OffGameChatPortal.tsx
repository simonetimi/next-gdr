import { createPortal } from "react-dom";
import Movable from "@/components/ui/Movable";
import { usePortalRoot } from "@/hooks/usePortalRoot";
import { useWindowSize } from "@uidotdev/usehooks";
import { Dispatch, SetStateAction } from "react";
import ChatConversations from "@/components/game/messaging/ChatConversations";
import { OffGameChatControl } from "@/components/game/OffGameChatControl";

export default function OffGameChatPortal({
  isSmallDevice,
  show,
  setShow,
}: {
  isSmallDevice: boolean;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  const portalRef = usePortalRoot();

  const windowSize = useWindowSize();

  const modalWidth = isSmallDevice ? windowSize.width! : 800;
  const modalHeight = isSmallDevice ? windowSize.height! : 600;

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
            component={<OffGameChatControl />}
            coords={[centerX, centerY]}
            width={modalWidth}
            height={modalHeight}
            minWidth={modalWidth - 100}
            minHeight={modalHeight - 50}
            showSetter={setShow}
            enableResizing={!isSmallDevice}
            enableMovement={!isSmallDevice}
            componentName="offGameChat"
          />,
          portalRef.current,
        )}
    </>
  );
}
