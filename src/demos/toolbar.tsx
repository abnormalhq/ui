"use client";

import { BoldIcon, ImagePlusIcon, ItalicIcon, LinkIcon, ListIcon, ListOrderedIcon, UnderlineIcon } from "lucide-react";
import { useState } from "react";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@/components/ui/toolbar";

export const defaultCopy = {
  formatting: "Formatting",
  insertImage: "Insert image",
  textStyle: "Text style",
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  lists: "Lists",
  bulletedList: "Bulleted list",
  numberedList: "Numbered list",
  link: "Link",
};

export default function ToolbarDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [marks, setMarks] = useState({ bold: true, italic: false, underline: false });
  const toggle = (mark: keyof typeof marks) => () => setMarks((was) => ({ ...was, [mark]: !was[mark] }));

  return (
    <Toolbar label={copy.formatting} className="rounded-control border border-border p-1">
      <ToolbarButton aria-label={copy.insertImage}>
        <ImagePlusIcon />
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarGroup aria-label={copy.textStyle}>
        <ToolbarButton
          aria-label={copy.bold}
          aria-keyshortcuts="Control+B Meta+B"
          pressed={marks.bold}
          onClick={toggle("bold")}
        >
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton aria-label={copy.italic} pressed={marks.italic} onClick={toggle("italic")}>
          <ItalicIcon />
        </ToolbarButton>
        <ToolbarButton aria-label={copy.underline} pressed={marks.underline} onClick={toggle("underline")}>
          <UnderlineIcon />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup aria-label={copy.lists}>
        <ToolbarButton aria-label={copy.bulletedList}>
          <ListIcon />
        </ToolbarButton>
        <ToolbarButton aria-label={copy.numberedList}>
          <ListOrderedIcon />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarButton aria-label={copy.link} disabled>
        <LinkIcon />
      </ToolbarButton>
    </Toolbar>
  );
}
