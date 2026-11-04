"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A native button with explicit switch semantics, for keyboard operation, such as a notification channel.
 * Controlled with checked and onCheckedChange, or uncontrolled with defaultChecked. With a name it also takes part in
 * a form like a native checkbox: a hidden checkbox submits name=value (value defaults to "on") while it is on.
 * It carries `peer`, so a Label placed after it dims while it is disabled.
 */
function Switch({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  name,
  value = "on",
  form,
  className,
  disabled,
  ...props
}: Omit<
  React.ComponentProps<"button">,
  "onChange" | "onClick" | "role" | "aria-checked" | "defaultChecked" | "value"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  value?: string;
}) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked);
  const checked = checkedProp ?? uncontrolled;

  return (
    <>
      <button
        {...props}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        data-slot="switch"
        data-state={checked ? "checked" : "unchecked"}
        className={cn(
          "peer relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-input bg-muted p-0.5 transition-colors duration-150 after:absolute after:-inset-x-1 after:-inset-y-2 hover:border-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-foreground data-checked:bg-foreground",
          className,
        )}
        onClick={() => {
          if (checkedProp === undefined) setUncontrolled(!checked);
          onCheckedChange?.(!checked);
        }}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none block size-4.5 rounded-full bg-muted-foreground shadow-xs transition-transform duration-150",
            checked ? "translate-x-4 bg-background" : "translate-x-0",
          )}
        />
      </button>
      {name !== undefined && (
        <input
          type="checkbox"
          hidden
          aria-hidden="true"
          tabIndex={-1}
          name={name}
          value={value}
          form={form}
          checked={checked}
          disabled={disabled}
          readOnly
        />
      )}
    </>
  );
}

export { Switch };
