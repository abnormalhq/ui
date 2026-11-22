"use client";

import { useState } from "react";
import { ResizeHandle } from "@/components/ui/resize-handle";

export const defaultCopy = {
  list: "Message list",
  defaultWidth: "default width",
  resizeLabel: "Resize the message list",
  instructions: "Drag the divider, or focus it and use the arrows.",
};

/* The page holds the width (a project saves it in a cookie from onValueCommit); null leaves it to the layout. */
export default function ResizeHandleDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [width, setWidth] = useState<number | null>(null);

  return (
    <div className="flex h-56 w-full max-w-xl overflow-hidden rounded-panel border border-border">
      <div
        id="resize-handle-list"
        className="w-[40%] shrink-0 bg-surface p-4 text-sm text-muted-foreground"
        style={width === null ? undefined : { width }}
      >
        {copy.list}, {width === null ? copy.defaultWidth : `${width}px`}
      </div>
      <ResizeHandle
        label={copy.resizeLabel}
        aria-controls="resize-handle-list"
        value={width}
        min={160}
        max={400}
        measure={() => document.getElementById("resize-handle-list")?.offsetWidth ?? 160}
        onValueChange={setWidth}
        onReset={() => setWidth(null)}
        className="border-l border-border"
      />
      <div className="flex-1 p-4 text-sm text-muted-foreground">{copy.instructions}</div>
    </div>
  );
}
