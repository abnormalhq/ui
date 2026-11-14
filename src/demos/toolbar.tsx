"use client";

import { BoldIcon, ImagePlusIcon, ItalicIcon, LinkIcon, ListIcon, ListOrderedIcon, UnderlineIcon } from "lucide-react";
import { useState } from "react";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@/components/ui/toolbar";

export default function ToolbarDemo() {
  const [marks, setMarks] = useState({ bold: true, italic: false, underline: false });
  const toggle = (mark: keyof typeof marks) => () => setMarks((was) => ({ ...was, [mark]: !was[mark] }));

  return (
    <Toolbar label="Formatting" className="rounded-control border border-border p-1">
      <ToolbarButton aria-label="Insert image">
        <ImagePlusIcon />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarGroup aria-label="Text style">
        <ToolbarButton
          aria-label="Bold"
          aria-keyshortcuts="Control+B Meta+B"
          pressed={marks.bold}
          onClick={toggle("bold")}
        >
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton aria-label="Italic" pressed={marks.italic} onClick={toggle("italic")}>
          <ItalicIcon />
        </ToolbarButton>
        <ToolbarButton aria-label="Underline" pressed={marks.underline} onClick={toggle("underline")}>
          <UnderlineIcon />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup aria-label="Lists">
        <ToolbarButton aria-label="Bulleted list">
          <ListIcon />
        </ToolbarButton>
        <ToolbarButton aria-label="Numbered list">
          <ListOrderedIcon />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarButton aria-label="Link" disabled>
        <LinkIcon />
      </ToolbarButton>
    </Toolbar>
  );
}
