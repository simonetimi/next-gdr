"use client";

import type { Editor } from "@tiptap/react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
  Link2,
  ListOrdered,
  List,
  Palette,
  Image,
  ALargeSmall,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@heroui/input";
import ImageSizeModal from "@/components/editor/ImageSizeModal";

const fontSizes = {
  "text-xs": "12px",
  "text-sm": "14px",
  "text-base": "16px",
  "text-lg": "18px",
  "text-xl": "20px",
  "text-2xl": "24px",
  "text-3xl": "30px",
  "text-4xl": "36px",
  "text-5xl": "48px",
  "text-6xl": "60px",
  "text-7xl": "72px",
};

interface CustomChain {
  focus: () => CustomChain;
  setFontSize: (fontSize: string) => CustomChain;
  run: () => boolean;
}

function EditorToolbar({ editor }: { editor: Editor | null }) {
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isImageSizeOpen, setIsImageSizeOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(
    null,
  );

  // TODO add translations with useTranslations
  // TODO imeplement popovers with the translations

  useEffect(() => {
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        setSelectedImage(target as HTMLImageElement);
        setIsImageSizeOpen(true);
      }
    };

    editor?.view.dom.addEventListener("click", handleImageClick);
    return () => {
      editor?.view.dom.removeEventListener("click", handleImageClick);
    };
  }, [editor]);

  if (!editor) return null;

  const handleImageSize = (width: number, height: number) => {
    if (selectedImage) {
      editor
        .chain()
        .focus()
        .updateAttributes("image", {
          src: selectedImage.src,
          width: width,
          height: height,
          alt: selectedImage.alt || "Image",
        })
        .run();
    }
  };

  const handleLinkSubmit = () => {
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
      setUrl("");
      setIsLinkOpen(false);
    }
  };

  const handleImageSubmit = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setIsImageOpen(false);
    }
  };

  return (
    <>
      <div className="border-input flex flex-wrap gap-1 rounded-2xl border bg-transparent p-2">
        <Button
          isIconOnly
          startContent={<Bold className="h-5 w-5" />}
          size="sm"
          className="h-7 min-h-7 w-7 min-w-7"
          onPress={() => editor.chain().focus().toggleBold().run()}
          color={editor.isActive("bold") ? "primary" : "default"}
        />
        <Button
          isIconOnly
          startContent={<Italic className="h-5 w-5" />}
          size="sm"
          className="h-7 min-h-7 w-7 min-w-7"
          onPress={() => editor.chain().focus().toggleItalic().run()}
          color={editor.isActive("italic") ? "primary" : "default"}
        />
        <Button
          isIconOnly
          startContent={<Underline className="h-5 w-5" />}
          size="sm"
          className="h-7 min-h-7 w-7 min-w-7"
          onPress={() => editor.chain().focus().toggleUnderline().run()}
          color={editor.isActive("underline") ? "primary" : "default"}
        />
        <Button
          isIconOnly
          startContent={<Strikethrough className="h-5 w-5" />}
          size="sm"
          className="h-7 min-h-7 w-7 min-w-7"
          onPress={() => editor.chain().focus().toggleStrike().run()}
          color={editor.isActive("strike") ? "primary" : "default"}
        />
        <Button
          isIconOnly
          startContent={<Link2 className="h-5 w-5" />}
          size="sm"
          className="h-7 min-h-7 w-7 min-w-7"
          onPress={() => setIsLinkOpen(true)}
          color={editor.isActive("link") ? "primary" : "default"}
        />
        <Button
          isIconOnly
          startContent={<Image className="h-5 w-5" />}
          size="sm"
          className="h-7 min-h-7 w-7 min-w-7"
          onPress={() => setIsImageOpen(true)}
        />
        <Button
          isIconOnly
          startContent={<ListOrdered className="h-5 w-5" />}
          size="sm"
          className="h-7 min-h-7 w-7 min-w-7"
          onPress={() => editor.chain().focus().toggleOrderedList().run()}
          color={editor.isActive("orderedList") ? "primary" : "default"}
        />
        <Button
          isIconOnly
          startContent={<List className="h-5 w-5" />}
          size="sm"
          className="h-7 min-h-7 w-7 min-w-7"
          onPress={() => editor.chain().focus().toggleBulletList().run()}
          color={editor.isActive("bulletList") ? "primary" : "default"}
        />
        <div className="relative">
          <input
            type="color"
            className="absolute h-7 w-7 cursor-pointer opacity-0"
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
          />
          <Button
            isIconOnly
            startContent={<Palette className="h-5 w-5" />}
            size="sm"
            className="pointer-events-none h-7 min-h-7 w-7 min-w-7"
          />
        </div>
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              startContent={<ALargeSmall className="h-5 w-5" />}
              size="sm"
              className="h-7 min-h-7 w-7 min-w-7"
            />
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Font sizes"
            items={Object.entries(fontSizes)}
            className="min-w-[120px]"
          >
            {(item) => (
              <DropdownItem
                key={item[0]}
                className={item[0]}
                onPress={() =>
                  (editor.chain() as unknown as CustomChain)
                    .focus()
                    .setFontSize(item[1])
                    .run()
                }
              >
                {item[1]}
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
        <Button
          isIconOnly
          startContent={<AlignLeft className="h-5 w-5" />}
          size="sm"
          className="h-7 min-h-7 w-7 min-w-7"
          onPress={() => editor.chain().focus().setTextAlign("left").run()}
          color={editor.isActive({ textAlign: "left" }) ? "primary" : "default"}
        />
        <Button
          isIconOnly
          startContent={<AlignCenter className="h-5 w-5" />}
          size="sm"
          className="h-7 min-h-7 w-7 min-w-7"
          onPress={() => editor.chain().focus().setTextAlign("center").run()}
          color={
            editor.isActive({ textAlign: "center" }) ? "primary" : "default"
          }
        />
        <Button
          isIconOnly
          startContent={<AlignRight className="h-5 w-5" />}
          size="sm"
          className="h-7 min-h-7 w-7 min-w-7"
          onPress={() => editor.chain().focus().setTextAlign("right").run()}
          color={
            editor.isActive({ textAlign: "right" }) ? "primary" : "default"
          }
        />
        <Button
          isIconOnly
          startContent={<AlignJustify className="h-5 w-5" />}
          size="sm"
          className="h-7 min-h-7 w-7 min-w-7"
          onPress={() => editor.chain().focus().setTextAlign("justify").run()}
          color={
            editor.isActive({ textAlign: "justify" }) ? "primary" : "default"
          }
        />
      </div>

      <Modal isOpen={isLinkOpen} onOpenChange={setIsLinkOpen}>
        <ModalContent>
          <ModalHeader>Add Link</ModalHeader>
          <ModalBody>
            <Input
              placeholder="https://"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  handleLinkSubmit();
                }
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setIsLinkOpen(false)}
            >
              Cancel
            </Button>
            <Button color="primary" onPress={handleLinkSubmit}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isImageOpen} onOpenChange={setIsImageOpen}>
        <ModalContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleImageSubmit();
            }}
          >
            <ModalHeader>Insert Image</ModalHeader>
            <ModalBody>
              <Input
                label="Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={() => setIsImageOpen(false)}
              >
                Cancel
              </Button>
              <Button color="primary" type="submit">
                Insert
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <ImageSizeModal
        isOpen={isImageSizeOpen}
        onOpenChange={setIsImageSizeOpen}
        onSubmit={handleImageSize}
        initialWidth={selectedImage?.width}
        initialHeight={selectedImage?.height}
      />
    </>
  );
}

export default EditorToolbar;
