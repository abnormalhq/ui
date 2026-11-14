"use client";

import { FileUpIcon, UploadIcon } from "lucide-react";
import { useState } from "react";
import { FileButton } from "@/components/ui/file-button";

export default function FileButtonDemo() {
  const [chosen, setChosen] = useState<string[]>([]);
  return (
    <div className="grid justify-items-start gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <FileButton variant="outline" accept="image/*" onFiles={(files) => setChosen(files.map((file) => file.name))}>
          <UploadIcon />
          Upload avatar
        </FileButton>
        <FileButton
          variant="ghost"
          size="xs"
          accept=".csv,text/csv,text/plain"
          multiple
          onFiles={(files) => setChosen(files.map((file) => file.name))}
        >
          <FileUpIcon />
          Choose CSV files
        </FileButton>
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {chosen.length > 0 ? chosen.join(", ") : "No file chosen"}
      </p>
    </div>
  );
}
