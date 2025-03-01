"use client";

import {
  ChainedCommands,
  EditorContent,
  Extension,
  useEditor,
} from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { RawCommands } from "@tiptap/core";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import EditorToolbar from "@/components/editor/EditorToolbar";
import {
  KeyboardEvent as ReactKeyboardEvent,
  Ref,
  useImperativeHandle,
} from "react";
import { useMediaQuery } from "@uidotdev/usehooks";

export default function Editor({
  content,
  onContentChange,
  containerClass,
  editorClass,
  onKeyDown,
  editorRef,
}: {
  content: string;
  onContentChange: (content: string) => void;
  containerClass?: string;
  editorClass?: string;
  onKeyDown?: (e: ReactKeyboardEvent) => void;
  editorRef?: Ref<{ clearContent: () => void }>;
}) {
  const isMobile = useMediaQuery("only screen and (max-width : 850px)");

  const EnterHandler = Extension.create({
    name: "enterHandler",
    addPriority() {
      return 100;
    },
    addKeyboardShortcuts() {
      return {
        Enter: () => {
          if (!this.options.onEnter) {
            return false;
          }
          return this.options.onEnter();
        },
      };
    },
    addOptions() {
      return {
        onEnter: () => false,
      };
    },
  });

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

  const FontFamily = Extension.create({
    name: "fontFamily",
    addGlobalAttributes() {
      return [
        {
          types: ["textStyle"],
          attributes: {
            fontFamily: {
              default: null,
              parseHTML: (element) => element.style.fontFamily || null,
              renderHTML: (attributes) => {
                if (!attributes.fontFamily) return {};
                return {
                  style: `font-family: ${attributes.fontFamily}`,
                };
              },
            },
          },
        },
      ];
    },
    addCommands() {
      return {
        setFontFamily:
          (fontFamily: string) =>
          ({ chain }: { chain: () => ChainedCommands }) => {
            return chain().setMark("textStyle", { fontFamily });
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
      FontFamily,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableCell,
      TableHeader,
      EnterHandler.configure({
        onEnter: () => {
          if (onKeyDown) {
            if (isMobile) {
              return false;
            }
            const syntheticEvent = {
              key: "Enter",
              preventDefault: () => {},
              stopPropagation: () => {},
            } as ReactKeyboardEvent;
            onKeyDown(syntheticEvent);
            return true;
          }
          return false;
        },
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: "tiptap prose text-sm",
      },
    },

    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
  });

  useImperativeHandle(
    editorRef,
    () => ({
      clearContent: () => {
        if (editor) {
          editor.commands.clearContent(true);
          editor.commands.focus();
        }
      },
    }),
    [editor],
  );

  return (
    <div className={`flex flex-col gap-2 ${containerClass}`}>
      <EditorToolbar editor={editor} />
      <EditorContent
        onKeyDown={onKeyDown}
        editor={editor}
        className={`overflow-y-auto rounded-lg border border-neutral-200 p-2 py-2 dark:border-neutral-700 ${editorClass}`}
      />
    </div>
  );
}
