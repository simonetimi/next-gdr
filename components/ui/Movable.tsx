"use client";

import { Button } from "@heroui/react";
import { X } from "lucide-react";
import { ReactElement } from "react";
import { Rnd } from "react-rnd";

interface MovableProps {
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  enableResizing?: boolean;
  boundsSelector: string;
  dragHandleClassName: string;
  component: ReactElement;
  stateSetter: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Movable({
  width = 600,
  height = 400,
  minWidth = 400,
  minHeight = 300,
  maxWidth = 900,
  maxHeight = 600,
  enableResizing = true,
  boundsSelector,
  dragHandleClassName,
  component,
  stateSetter,
}: MovableProps) {
  const onClose = () => {
    stateSetter(false);
  };

  return (
    <div>
      <Rnd
        className="rounded-2xl border-1 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
        bounds={boundsSelector}
        dragHandleClassName={dragHandleClassName}
        minWidth={minWidth}
        minHeight={minHeight}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        enableResizing={enableResizing}
        default={{
          x: 0,
          y: 200,
          width: width,
          height: height,
        }}
      >
        <div className="flex h-12 border-b-1 border-gray-200 p-2 dark:border-gray-700">
          <div className={`${dragHandleClassName} w-full flex-1 cursor-move`} />
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
