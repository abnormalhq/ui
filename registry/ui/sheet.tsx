"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Dialog as SheetPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Right-hand drawer: click a row in a list to open its details (redeem code, log). It is essentially a Radix Dialog: focus is trapped inside, Esc closes it, and screen readers treat it as a dialog;
 * visually it is a full-height panel attached to the right edge, with a fixed header, scrolling content and actions at the bottom.
 */
function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetContent({
  className,
  children,
  onOpenAutoFocus,
  side = "right",
  closeLabel = "Close",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  /** Attached to the right by default (details); `left` is used as the navigation drawer on narrow screens (WebMail's folder column). */
  side?: "left" | "right";
  /** Accessible name of the close button; pass the translated word. */
  closeLabel?: string;
}) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/30 data-open:animate-fade-in data-closed:animate-fade-out dark:bg-black/60" />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed inset-y-0 z-50 flex w-full max-w-[480px] flex-col bg-popover text-popover-foreground shadow-popover outline-none",
          side === "right"
            ? "right-0 border-l border-border data-open:animate-slide-in-right data-closed:animate-slide-out-right"
            : "left-0 border-r border-border data-open:animate-slide-in-left data-closed:animate-slide-out-left",
          className,
        )}
        // By default the first button gets focus (usually "Copy" in details), and that focus ring looks jarring when opening by clicking a row; focus the panel itself instead, and Tab then moves into the buttons.
        onOpenAutoFocus={(event) => {
          onOpenAutoFocus?.(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          (event.currentTarget as HTMLElement).focus();
        }}
        {...props}
      >
        {children}
        <SheetPrimitive.Close asChild>
          <Button variant="ghost" size="icon-sm" className="absolute top-3.5 right-3.5">
            <XIcon />
            <span className="sr-only">{closeLabel}</span>
          </Button>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex shrink-0 flex-col gap-1.5 border-b border-border px-6 py-5 pr-14", className)}
      {...props}
    />
  );
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sheet-body" className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-5", className)} {...props} />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border px-6 py-4",
        className,
      )}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-lg font-semibold", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/** The "name — value" two-column list in details. */
function SheetFields({ className, ...props }: React.ComponentProps<"dl">) {
  return (
    <dl
      data-slot="sheet-fields"
      className={cn("grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm", className)}
      {...props}
    />
  );
}

function SheetField({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </>
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetFields,
  SheetField,
};
