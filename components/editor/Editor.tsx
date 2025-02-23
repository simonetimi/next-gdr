"use client";

import { EditorContent, Extension, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { RawCommands } from "@tiptap/core";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import EditorToolbar from "@/components/editor/EditorToolbar";
import dynamic from "next/dynamic";

function Editor({
  content,
  onContentChange,
  className,
}: {
  content: string;
  onContentChange: (content: string) => void;
  className?: string;
}) {
  const CustomImage = Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: null,
          parseHTML: (element) => element.getAttribute("width"),
          renderHTML: (attributes) => {
            if (!attributes.width) {
              return {};
            }
            return { width: attributes.width };
          },
        },
        height: {
          default: null,
          parseHTML: (element) => element.getAttribute("height"),
          renderHTML: (attributes) => {
            if (!attributes.height) {
              return {};
            }
            return { height: attributes.height };
          },
        },
      };
    },
  });

  const FontSize = Extension.create({
    name: "fontSize",
    addGlobalAttributes() {
      return [
        {
          types: ["textStyle"],
          attributes: {
            fontSize: {
              default: null,
              parseHTML: (element) => element.style.fontSize || null,
              renderHTML: (attributes) => {
                const fontSize = attributes.fontSize as string | null;
                if (!fontSize) return {};
                const size = parseInt(fontSize);
                const lineHeight = `${size * 1.2}px`;
                return {
                  style: `font-size: ${fontSize}; line-height: ${lineHeight}`,
                };
              },
            },
          },
        },
      ];
    },
    addCommands() {
      return {
        setFontSize:
          (fontSize: string) =>
          ({ commands }: { commands: RawCommands }) => {
            return commands.setMark("textStyle", { fontSize });
          },
      } as unknown as Partial<RawCommands>;
    },
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure(),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      CustomImage,
      TextStyle,
      Color,
      FontSize,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          "text-sm prose max-w-none w-full rounded-lg border border-default-200 bg-content1 px-3 py-2 h-[200px] overflow-y-auto outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
      console.log(editor.getHTML());
    },
  });

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

export default dynamic(() => Promise.resolve(Editor), {
  ssr: false,
});
