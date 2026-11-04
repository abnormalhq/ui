"use client";

import { CheckIcon, CopyIcon, XIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Status = "idle" | "copied" | "failed";

const messages: Record<Status, string> = { idle: "", copied: "Copied", failed: "Copy failed" };
const icons: Record<Status, ReactNode> = { idle: <CopyIcon />, copied: <CheckIcon />, failed: <XIcon /> };

/**
 * Copies a code block. The icon shows the outcome; a screen reader hears it once, from the status message, while the
 * button keeps its name, so the outcome is not announced a second time as a name change of the focused button.
 */
export function CopyButton({ code }: { code: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const reset = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(reset.current);
    };
  }, []);

  const show = (next: Status) => {
    // writeText can settle after the code block has gone, such as on a page change.
    if (!mounted.current) return;
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
        aria-label="Copy"
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
        {messages[status]}
      </span>
    </>
  );
}
