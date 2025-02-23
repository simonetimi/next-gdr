"use client";

import { useState } from "react";
import Editor from "@/components/editor/Editor";

function Test() {
  const [content, setContent] = useState("");

  return (
    <Editor
      content={content}
      onContentChange={setContent}
      className="w-[560px]"
    />
  );
}

export default Test;
