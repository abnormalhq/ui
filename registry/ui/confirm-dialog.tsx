"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description: React.ReactNode;
  /** Text of the confirm button; pass the translated word. */
  confirmLabel: React.ReactNode;
  /** Text of the cancel button; pass the translated word. */
  cancelLabel: React.ReactNode;
  onConfirm: () => void;
  /** For what cannot be undone, such as delete and disable: the confirm button is red. */
  destructive?: boolean;
  /** The confirm button cannot be clicked yet, such as while an extra option in the dialog is not chosen. */
  confirmDisabled?: boolean;
  /** A controlled dialog has no trigger, and Radix would drop focus back to body: focus returns to this element instead. */
  returnFocusTo?: React.RefObject<HTMLElement | null>;
  /**
   * Given, the dialog closes only when the caller closes it: confirming does not close it, and while true neither
   * button, Escape nor a click outside can, so a confirmation never vanishes halfway through the work it started.
   */
  pending?: boolean;
  className?: string;
  /** Extra content between the description and the buttons, such as choosing a new role before demoting. */
  children?: React.ReactNode;
}

/**
 * A second look before an action: title, description, cancel and confirm. Controlled, so a row menu or a form can
 * open it; after it closes, focus returns to the button that opened it.
 */
function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  destructive = false,
  confirmDisabled = false,
  returnFocusTo,
  pending,
  className,
  children,
}: ConfirmDialogProps) {
  const busy = pending === true;
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && busy) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogContent
        className={className}
        onCloseAutoFocus={(event) => {
          if (!returnFocusTo?.current) return;
          event.preventDefault();
          returnFocusTo.current.focus();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? "destructive" : "default"}
            loading={busy}
            disabled={confirmDisabled}
            onClick={(event) => {
              // Closing is the caller's: block the automatic close, and the caller closes it when done.
              if (pending !== undefined) event.preventDefault();
              onConfirm();
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** A button that asks first: it owns the dialog's open state, and focus comes back to it when the dialog closes. */
function ConfirmButton({
  children,
  disabled,
  variant = "outline",
  size = "sm",
  buttonLabel,
  ...confirm
}: Omit<ConfirmDialogProps, "open" | "onOpenChange" | "returnFocusTo" | "children" | "pending"> & {
  children: React.ReactNode;
  disabled?: boolean;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  /** The button's accessible name when its content is only an icon. */
  buttonLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button
        ref={buttonRef}
        type="button"
        variant={variant}
        size={size}
        disabled={disabled}
        aria-label={buttonLabel}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>
      <ConfirmDialog {...confirm} open={open} onOpenChange={setOpen} returnFocusTo={buttonRef} />
    </>
  );
}

export { ConfirmDialog, ConfirmButton, type ConfirmDialogProps };
