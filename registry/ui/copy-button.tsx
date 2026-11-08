"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CheckIcon, CopyIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Feedback = "idle" | "copied" | "failed";

/** Where the bubble points: the middle of the button's top edge, or of its bottom edge when the top is too close to the viewport edge. */
type Anchor = { x: number; y: number; below: boolean };

/** The bubble needs about this much room above the button; with less, it opens below. */
const BUBBLE_ROOM = 32;

/**
 * Copies a value and shows how it went. The icon turns into a check or a cross for 1.5 seconds, and an icon-only
 * button also pops a small bubble, since it has no text to change. The bubble is attached to body and placed by
 * viewport coordinates, so a clipping container (a scrolling table, a floating window) cannot cut it off.
 * The button keeps its name throughout; a status region announces the outcome once, so a screen reader does not
 * hear it a second time as a name change. With children it is a text button ("Copy address") and shows no bubble.
 * `write` replaces the clipboard call, for a page that needs a fallback outside secure contexts; it throws to fail.
 */
function CopyButton({
  text,
  label,
  copiedLabel,
  failedLabel,
  write,
  children,
  variant = "ghost",
  size,
  className,
  onClick,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "asChild" | "loading"> & {
  /** What is copied. */
  text: string;
  /** The button's accessible name, such as "Copy address"; the title too. */
  label: string;
  /** Announced and shown after a copy, such as "Copied". */
  copiedLabel: string;
  /** Announced and shown when the clipboard refused, such as "Copy failed". */
  failedLabel: string;
  /** How to copy, instead of navigator.clipboard; reject or throw when it could not. */
  write?: (text: string) => void | Promise<void>;
}) {
  const [feedback, setFeedback] = React.useState<Feedback>("idle");
  const [anchor, setAnchor] = React.useState<Anchor | null>(null);
  const reset = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(reset.current);
    };
  }, []);

  const show = (next: Feedback) => {
    // writeText can settle after the button has gone, such as on a page change.
    if (!mounted.current) return;
    setFeedback(next);
    clearTimeout(reset.current);
    reset.current = setTimeout(() => setFeedback("idle"), 1500);
  };

  const Icon = feedback === "copied" ? CheckIcon : feedback === "failed" ? XIcon : CopyIcon;
  const outcome = feedback === "copied" ? copiedLabel : feedback === "failed" ? failedLabel : "";
  const iconOnly = children === undefined || children === null || children === false;

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size ?? (iconOnly ? "icon-xs" : "xs")}
        title={label}
        aria-label={iconOnly ? label : undefined}
        data-feedback={feedback === "idle" ? undefined : feedback}
        className={cn(
          "relative",
          feedback === "copied" && "text-success",
          feedback === "failed" && "text-destructive",
          className,
        )}
        onClick={async (event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const below = rect.top < BUBBLE_ROOM;
          setAnchor({ x: rect.left + rect.width / 2, y: below ? rect.bottom : rect.top, below });
          try {
            if (write) await write(text);
            else {
              // There is no clipboard outside a secure context, and writeText rejects without permission or focus.
              if (!navigator.clipboard) throw new Error("Clipboard unavailable");
              await navigator.clipboard.writeText(text);
            }
            show("copied");
          } catch {
            show("failed");
          }
        }}
        {...props}
      >
        {/* The key changes with the outcome, so the pop plays again when the icon changes. */}
        <Icon key={feedback} className={feedback === "idle" ? undefined : "animate-pop"} />
        {children}
      </Button>
      {iconOnly &&
        feedback !== "idle" &&
        anchor &&
        createPortal(
          <span
            aria-hidden="true"
            data-slot="copy-button-bubble"
            style={{ left: anchor.x, top: anchor.y }}
            className={cn(
              "pointer-events-none fixed z-[60] -translate-x-1/2 rounded-control bg-foreground px-2 py-1 text-xs leading-none font-medium whitespace-nowrap text-background",
              anchor.below ? "mt-1.5" : "-mt-1.5 -translate-y-full",
            )}
          >
            <span className="block animate-pop">{outcome}</span>
          </span>,
          document.body,
        )}
      <span role="status" className="sr-only">
        {outcome}
      </span>
    </>
  );
}

export { CopyButton };
