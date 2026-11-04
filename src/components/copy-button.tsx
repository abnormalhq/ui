"use client";

import { CheckIcon, CopyIcon, XIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Status = "idle" | "copied" | "failed";

const labels: Record<Status, string> = { idle: "Copy", copied: "Copied", failed: "Copy failed" };
const icons: Record<Status, ReactNode> = { idle: <CopyIcon />, copied: <CheckIcon />, failed: <XIcon /> };

export function CopyButton({ code }: { code: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const reset = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(reset.current), []);

  const show = (next: Status) => {
    setStatus(next);
    clearTimeout(reset.current);
    reset.current = setTimeout(() => setStatus("idle"), 1500);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon-xs"
        className="absolute top-2 right-2 bg-surface"
        aria-label={labels[status]}
        onClick={async () => {
          try {
            // There is no clipboard outside a secure context, and writeText rejects without permission or focus.
            if (!navigator.clipboard) throw new Error("Clipboard unavailable");
            await navigator.clipboard.writeText(code);
            show("copied");
          } catch {
            show("failed");
          }
        }}
      >
        {icons[status]}
      </Button>
      <span role="status" className="sr-only">
        {status === "idle" ? "" : labels[status]}
      </span>
    </>
  );
}
