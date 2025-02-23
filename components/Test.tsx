"use client";

import { useEffect, useState } from "react";
import Editor from "@/components/editor/Editor";

function Test() {
  const [content, setContent] = useState("");

  useEffect(() => {
    console.log(content);
  }, [content]);

  return (
    <Editor
      content={content}
      onContentChange={setContent}
      className="w-[500px]"
    />
  );
}

export default Test;
