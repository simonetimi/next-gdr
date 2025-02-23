import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";

interface ImageSizeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (width: number, height: number) => void;
  initialWidth?: number;
  initialHeight?: number;
}

export default function ImageSizeModal({
  isOpen,
  onOpenChange,
  onSubmit,
  initialWidth = 200,
  initialHeight = 200,
}: ImageSizeModalProps) {
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [aspect, setAspect] = useState(initialWidth / initialHeight);

  // TODO implement translations

  useEffect(() => {
    if (maintainRatio) {
      if (width !== initialWidth) {
        setHeight(Math.round(width / aspect));
      } else if (height !== initialHeight) {
        setWidth(Math.round(height * aspect));
      }
    }
  }, [width, height, maintainRatio]);

  const handleSubmit = () => {
    onSubmit(width, height);
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <ModalHeader>Image Size</ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Input
                type="number"
                label="Width"
                value={width?.toString()}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
              <Input
                type="number"
                label="Height"
                value={height.toString()}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </div>
            <Checkbox
              isSelected={maintainRatio}
              onValueChange={setMaintainRatio}
            >
              Maintain aspect ratio
            </Checkbox>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button color="primary" type="submit">
              Apply
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
