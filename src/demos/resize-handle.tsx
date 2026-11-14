"use client";

import { useState } from "react";
import { ResizeHandle } from "@/components/ui/resize-handle";

/* The page holds the width (a project saves it in a cookie from onValueCommit); null leaves it to the layout. */
export default function ResizeHandleDemo() {
  const [width, setWidth] = useState<number | null>(null);

  return (
    <div className="flex h-56 w-full max-w-xl overflow-hidden rounded-panel border border-border">
      <div
        id="resize-handle-list"
        className="w-[40%] shrink-0 bg-surface p-4 text-sm text-muted-foreground"
        style={width === null ? undefined : { width }}
      >
        Message list, {width === null ? "default width" : `${width}px`}
      </div>
      <ResizeHandle
        label="Resize the message list"
        aria-controls="resize-handle-list"
        value={width}
        min={160}
        max={400}
        measure={() => document.getElementById("resize-handle-list")?.offsetWidth ?? 160}
        onValueChange={setWidth}
        onReset={() => setWidth(null)}
        className="border-l border-border"
      />
      <div className="flex-1 p-4 text-sm text-muted-foreground">Drag the divider, or focus it and use the arrows.</div>
    </div>
  );
}
