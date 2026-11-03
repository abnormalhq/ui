"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Provided as a native button for keyboard operation, expressing notification channels with explicit switch semantics. */
function Switch({
  checked,
  onCheckedChange,
  className,
  disabled,
  ...props
}: Omit<ComponentProps<"button">, "onChange" | "onClick" | "role" | "aria-checked"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <button
      {...props}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      data-slot="switch"
      data-state={checked ? "checked" : "unchecked"}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-input bg-muted p-0.5 transition-colors duration-150 after:absolute after:-inset-x-1 after:-inset-y-2 hover:border-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-foreground data-checked:bg-foreground",
        className,
      )}
      onClick={() => onCheckedChange(!checked)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none block size-4.5 rounded-full bg-muted-foreground shadow-xs transition-transform duration-150",
          checked ? "translate-x-4 bg-background" : "translate-x-0",
        )}
      />
    </button>
  );
}

export { Switch };
