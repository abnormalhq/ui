"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

/**
 * A dialog that cannot be closed while it is saving: while `pending`, the close button in the corner goes away,
 * and Escape, a click on the overlay and onOpenChange(false) are ignored, so a form is never dismissed halfway
 * through a submit with nobody there to see the result. Every form dialog should be one.
 * After it closes, focus returns to `returnFocusTo`, usually the button that opened it; a dialog with a `trigger`
 * gets that for free from Radix. useOpenCount, next to this file, keys the form so every open starts clean.
 */
function GuardedDialog({
  open,
  onOpenChange,
  pending,
  returnFocusTo,
  trigger,
  closeLabel,
  children,
  onEscapeKeyDown,
  onInteractOutside,
  onCloseAutoFocus,
  ...props
}: Omit<React.ComponentProps<typeof DialogContent>, "showCloseButton" | "closeLabel"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  /** A controlled dialog has no trigger, and Radix would drop focus back to body: focus returns to this element instead. */
  returnFocusTo?: React.RefObject<HTMLElement | null>;
  /** The button that opens the dialog, wrapped in a DialogTrigger; without one, the page opens it. */
  trigger?: React.ReactNode;
  /** Accessible name of the close button; pass the translated word. */
  closeLabel: string;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && pending) return;
        onOpenChange(next);
      }}
    >
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        {...props}
        closeLabel={closeLabel}
        showCloseButton={!pending}
        onEscapeKeyDown={(event) => {
          onEscapeKeyDown?.(event);
          if (pending) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          onInteractOutside?.(event);
          if (pending) event.preventDefault();
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event);
          if (event.defaultPrevented || !returnFocusTo?.current) return;
          event.preventDefault();
          returnFocusTo.current.focus();
        }}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

export { GuardedDialog };
