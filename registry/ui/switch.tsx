"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFormReset } from "@/components/ui/use-form-reset";

/**
 * A native button with explicit switch semantics, for keyboard operation, such as a notification channel.
 * Controlled with checked and onCheckedChange, or uncontrolled with defaultChecked. It carries `peer`, so a Label
 * placed after it dims while it is disabled.
 *
 * With a name it takes part in a form like a native checkbox: while it is on and not disabled, a hidden input inside
 * the button submits name=value (value defaults to "on"). That input has no checked state of its own for a form reset
 * to change, so what the form submits always follows what the switch shows, and the switch stays a single element.
 *
 * A form reset (a reset button, form.reset(), or the reset React runs after a form action) treats it like a checkbox:
 * an uncontrolled switch goes back to defaultChecked without calling onCheckedChange, and until it is toggled it
 * follows defaultChecked, so the reset lands on the default the page renders now, such as the value an action saved.
 * A controlled switch keeps showing and submitting its checked prop; handle the form's onReset to reset it too.
 * A reset the page cancels (preventDefault in the form's onReset) leaves it alone, as it leaves a checkbox.
 */
function Switch({
  ref,
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
  // The user's choice while uncontrolled: null until they toggle it, and again after a form reset.
  const [toggled, setToggled] = React.useState<boolean | null>(null);
  const checked = checkedProp ?? toggled ?? defaultChecked;
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  React.useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement, []);

  // The form the button belongs to, as an ancestor or through the form attribute.
  useFormReset(buttonRef, () => setToggled(null));

  return (
    <button
      {...props}
      ref={buttonRef}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      form={form}
      data-slot="switch"
      data-state={checked ? "checked" : "unchecked"}
      className={cn(
        "peer relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-input bg-muted p-0.5 transition-colors duration-150 after:absolute after:-inset-x-1 after:-inset-y-2 hover:border-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-foreground data-checked:bg-foreground",
        className,
      )}
      onClick={() => {
        if (checkedProp === undefined) setToggled(!checked);
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
      {/* A hidden input is not interactive content, so it may sit inside the button. */}
      {name !== undefined && checked && !disabled && <input type="hidden" name={name} value={value} form={form} />}
    </button>
  );
}

export { Switch };
