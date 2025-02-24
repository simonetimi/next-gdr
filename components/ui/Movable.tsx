"use client";

import { Button } from "@heroui/react";
import { Minimize2, X } from "lucide-react";
import { Dispatch, ReactElement, SetStateAction, useState } from "react";
import { Rnd } from "react-rnd";
import { useTranslations } from "next-intl";

interface MovableProps {
  width?: number | string;
  height?: number | string;
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

export default function Movable({
  width = 600,
  height = 400,
  minWidth = 400,
  minHeight = 300,
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

  const onClose = () => {
    showSetter(false);
  };

  const onMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  return (
    <div className="absolute z-20">
      <Rnd
        className="rounded-2xl border-1 border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-black/80"
        bounds={boundsSelector}
        dragHandleClassName={dragHandleClassName}
        minWidth={isMinimized ? 350 : minWidth}
        minHeight={isMinimized ? 48 : minHeight}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        enableResizing={!isMinimized && enableResizing}
        default={{
          x: coords[0],
          y: coords[1],
          width,
          height,
        }}
        size={{
          width: isMinimized ? 350 : width,
          height: isMinimized ? 48 : height,
        }}
      >
        <div
          className={`flex h-12 p-2 ${isMinimized ? "" : "border-b-1 border-gray-200 dark:border-gray-700"}`}
        >
          {enableMovement && (
            <div
              className={`${dragHandleClassName} flex w-full flex-1 cursor-move`}
            >
              <span className="ml-2 self-center font-bold">
                {t(`${componentName}.title`)}
              </span>
            </div>
          )}
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
        {!isMinimized && <div className="p-4">{component}</div>}
      </Rnd>
    </div>
  );
}
