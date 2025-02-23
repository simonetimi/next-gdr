import { createPortal } from "react-dom";
import Movable from "@/components/ui/Movable";
import OnlineUsers from "@/components/game/OnlineUsers";
import { usePortalRoot } from "@/hooks/usePortalRoot";
import { Dispatch, SetStateAction } from "react";

export default function OnlineCharactersPortal({
  isSmallDevice,
  show,
  setShow,
}: {
  isSmallDevice: boolean;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  const portalRef = usePortalRoot();

  return (
    <>
      {show &&
        portalRef.current &&
        createPortal(
          <Movable
            boundsSelector="body"
            dragHandleClassName="handle"
            component={<OnlineUsers />}
            coords={isSmallDevice ? [0, 140] : [0, 110]}
            width={isSmallDevice ? "100vw" : 1000}
            minWidth={isSmallDevice ? "100vw" : 800}
            minHeight={isSmallDevice ? "calc(99vh - 140px)" : 550}
            height={isSmallDevice ? "calc(99vh - 140px)" : 600}
            showSetter={setShow}
            enableResizing={!isSmallDevice}
            enableMovement={!isSmallDevice}
            componentName="onlineCharacters"
          />,
          portalRef.current,
        )}
    </>
  );
}
