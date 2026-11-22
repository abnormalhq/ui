"use client";

import { FileUpIcon, UploadIcon } from "lucide-react";
import { useState } from "react";
import { FileButton } from "@/components/ui/file-button";

export const defaultCopy = {
  uploadAvatar: "Upload avatar",
  chooseCsv: "Choose CSV files",
  noFile: "No file chosen",
};

export default function FileButtonDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [chosen, setChosen] = useState<string[]>([]);
  return (
    <div className="grid justify-items-start gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <FileButton variant="outline" accept="image/*" onFiles={(files) => setChosen(files.map((file) => file.name))}>
          <UploadIcon />
          {copy.uploadAvatar}
        </FileButton>
        <FileButton
          variant="ghost"
          size="xs"
          accept=".csv,text/csv,text/plain"
          multiple
          onFiles={(files) => setChosen(files.map((file) => file.name))}
        >
          <FileUpIcon />
          {copy.chooseCsv}
        </FileButton>
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {chosen.length > 0 ? chosen.join(", ") : copy.noFile}
      </p>
    </div>
  );
}
