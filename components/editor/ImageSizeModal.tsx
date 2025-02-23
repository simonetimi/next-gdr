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
import { useTranslations } from "next-intl";

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

  const t = useTranslations("components.editor");

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
          <ModalHeader> {t("imageSize")}</ModalHeader>
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
              {t("keepAspectRatio")}
            </Checkbox>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button color="primary" type="submit">
              {t("apply")}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
