"use client";

import { Button } from "@heroui/react";
import { Minimize2, X } from "lucide-react";
import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Rnd } from "react-rnd";
import { useTranslations } from "next-intl";

interface MovableProps {
  width: number | string;
  height: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  coords?: number[];
  enableResizing?: boolean;
  enableMovement?: boolean;
  boundsSelector: string;
  dragHandleClassName: string;
  component: ReactElement;
  showSetter: Dispatch<SetStateAction<boolean>>;
  componentName: string;
}

interface MovableSizeInterface {
  width: number | string;
  height: number | string;
}

export default function Movable({
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  coords = [0, 0],
  enableResizing = true,
  enableMovement = true,
  boundsSelector,
  dragHandleClassName,
  component,
  showSetter,
  componentName,
}: MovableProps) {
  const t = useTranslations("components");
  const [isMinimized, setIsMinimized] = useState(false);
  const [movableSize, setMovableSize] = useState<MovableSizeInterface>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    setMovableSize({ width, height });
  }, [width, height]);

  const onClose = () => {
    showSetter(false);
  };

  const onMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <div className="absolute z-20">
      <Rnd
        className="rounded-2xl border-1 border-default-200 bg-white/80 backdrop-blur-md dark:border-default-100 dark:bg-black/80"
        bounds={boundsSelector}
        dragHandleClassName={dragHandleClassName}
        minWidth={isMinimized ? 350 : minWidth}
        minHeight={isMinimized ? 48 : minHeight}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        enableResizing={!isMinimized && enableResizing}
        onResizeStop={(_e, _direction, ref) => {
          setMovableSize({
            width: ref.offsetWidth,
            height: ref.offsetHeight,
          });
        }}
        default={{
          x: coords[0],
          y: coords[1],
          width,
          height,
        }}
        size={{
          width: isMinimized ? 350 : movableSize.width,
          height: isMinimized ? 48 : movableSize.height,
        }}
      >
        <div
          className={`flex h-12 p-2 ${isMinimized ? "" : "border-b-1 border-default-200 dark:border-default-100"}`}
        >
          <div
            className={`flex w-full flex-1 ${
              enableMovement && `${dragHandleClassName} cursor-move` // render the handle and cursor classes only when movement is enabled
            }`}
          >
            <span className="ml-2 self-center font-bold">
              {t(`${componentName}.title`)}
            </span>
          </div>
          <Button
            color="primary"
            className="ml-auto h-7 min-h-7 w-7 min-w-7"
            isIconOnly
            onPress={onMinimize}
            size="sm"
            startContent={<Minimize2 className="h-4 w-4" />}
          />
          <Button
            color="danger"
            className="ml-1 h-7 min-h-7 w-7 min-w-7"
            isIconOnly
            onPress={onClose}
            size="sm"
            startContent={<X className="h-4 w-4" />}
          />
        </div>
        <div
          className={`h-[92vh] p-4 lg:h-[94%] ${isMinimized ? "hidden" : ""}`}
        >
          {component}
        </div>
      </Rnd>
    </div>
  );
}
