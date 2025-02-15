"use client";

import { Button } from "@heroui/react";
import { X } from "lucide-react";
import { ReactElement } from "react";
import { Rnd } from "react-rnd";

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
  showSetter: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Movable({
  width = 600,
  height = 400,
  minWidth = 400,
  minHeight = 300,
  maxWidth = 900,
  maxHeight = 600,
  coords = [0, 0],
  enableResizing = true,
  enableMovement = true,
  boundsSelector,
  dragHandleClassName,
  component,
  showSetter,
}: MovableProps) {
  const onClose = () => {
    showSetter(false);
  };

  return (
    <div className="absolute z-50">
      <Rnd
        className="rounded-2xl border-1 border-gray-200 bg-transparent backdrop-blur-md dark:border-gray-700"
        bounds={boundsSelector}
        dragHandleClassName={dragHandleClassName}
        minWidth={minWidth}
        minHeight={minHeight}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        enableResizing={enableResizing}
        default={{
          x: coords[0],
          y: coords[1],
          width,
          height,
        }}
      >
        <div className="flex h-12 border-b-1 border-gray-200 p-2 dark:border-gray-700">
          {enableMovement && (
            <div
              className={`${dragHandleClassName} w-full flex-1 cursor-move`}
            />
          )}
          <Button
            color="danger"
            className="ml-auto"
            isIconOnly
            onPress={onClose}
            size="sm"
            startContent={<X />}
          />
        </div>
        <div className="p-4">{component}</div>
      </Rnd>
    </div>
  );
}
