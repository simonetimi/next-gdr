import { createPortal } from "react-dom";
import Movable from "@/components/ui/Movable";
import { usePortalRoot } from "@/hooks/usePortalRoot";
import { Dispatch, SetStateAction } from "react";
import { UserSettings } from "@/components/game/UserSettings";
import { useWindowSize } from "@uidotdev/usehooks";

export default function SettingsPortal({
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

  const modalWidth = isSmallDevice ? windowSize.width! : 600;
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
            component={<UserSettings />}
            coords={[centerX, centerY]}
            width={modalWidth}
            height={modalHeight}
            minWidth={modalWidth}
            minHeight={modalHeight}
            showSetter={setShow}
            enableResizing={false}
            enableMovement={!isSmallDevice}
            componentName="settings"
          />,
          portalRef.current,
        )}
    </>
  );
}
