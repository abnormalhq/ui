"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="relative min-w-0 rounded-control border border-border bg-surface">
      <pre className="overflow-x-auto p-3 pr-11 font-mono text-sm/relaxed">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon-xs"
        className="absolute top-2 right-2 bg-surface"
        aria-label={copied ? "Copied" : "Copy"}
        onClick={async () => {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
    </div>
  );
}
