"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";
import { FieldMessage } from "@/components/ui/field-message";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type FieldContextValue = { controlId: string; hintId: string; error?: React.ReactNode; disabled: boolean };

const FieldContext = React.createContext<FieldContextValue | null>(null);

function useField(component: string) {
  const field = React.useContext(FieldContext);
  if (!field) throw new Error(`${component} must be inside a Field`);
  return field;
}

/**
 * One form field with its words wired to it: a FieldLabel, the control in a FieldControl, and a FieldHint under it.
 * The label points at the control, and the control at the hint (aria-describedby), with ids Field makes, or from `id`,
 * which becomes the control's own.
 * `error` is the field's error, in the page's words. While there is one the control is aria-invalid and the hint
 * shows the error in its place, in the error tone and announced at once; the description comes back when it clears.
 * So the error and the description are one line with one id, which aria-describedby always finds.
 * `orientation="row"` is the setting row: the label and the hint on the left, the control on the right, in a bordered
 * box, for a switch or a short select in a settings card. SwitchField is that row with a Switch in it.
 */
function Field({
  id,
  error,
  disabled = false,
  orientation = "vertical",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  /** The control's id; one is made when it is left out. */
  id?: string;
  /** The error to show, which makes the field invalid; leave it out, or pass undefined, for a valid field. */
  error?: React.ReactNode;
  disabled?: boolean;
  orientation?: "vertical" | "row";
}) {
  const made = React.useId();
  const controlId = id ?? made;
  const invalid = error !== undefined && error !== null && error !== false && error !== "";
  const value = React.useMemo(
    () => ({ controlId, hintId: `${controlId}-hint`, error: invalid ? error : undefined, disabled }),
    [controlId, invalid, error, disabled],
  );
  return (
    <FieldContext.Provider value={value}>
      <div
        data-slot="field"
        data-orientation={orientation}
        data-invalid={invalid || undefined}
        // "true", which is what Label dims for.
        data-disabled={disabled ? "true" : undefined}
        className={cn(
          // The grid gap spaces the hint, and an empty hint takes no row.
          "group grid min-w-0 [&>[data-slot=field-message]]:mt-0 [&>[data-slot=field-message]:empty]:hidden",
          orientation === "vertical"
            ? "gap-2"
            : "grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-control border border-border p-3 [&>[data-field-control]]:col-start-2 [&>[data-field-control]]:row-span-2 [&>[data-field-control]]:row-start-1",
          className,
        )}
        {...props}
      />
    </FieldContext.Provider>
  );
}

/** The field's name, tied to the control. It dims with a disabled Field. */
function FieldLabel({ className, ...props }: Omit<React.ComponentProps<typeof Label>, "htmlFor">) {
  const field = useField("FieldLabel");
  return (
    <Label
      htmlFor={field.controlId}
      className={cn("group-data-[orientation=row]:leading-normal", className)}
      {...props}
    />
  );
}

/**
 * Wraps the one control of the field (an Input, a Select's trigger, a Switch) and hands it the id, the
 * aria-describedby and the aria-invalid; it renders no element of its own. A describedby the control already has is kept.
 */
function FieldControl({ "aria-describedby": describedBy, ...props }: React.ComponentProps<typeof Slot.Root>) {
  const field = useField("FieldControl");
  return (
    <Slot.Root
      data-field-control=""
      id={field.controlId}
      aria-describedby={[describedBy, field.hintId].filter(Boolean).join(" ")}
      aria-invalid={field.error !== undefined || undefined}
      // Slot's own props do not know `disabled`; it reaches the control, which does.
      {...(field.disabled ? { disabled: true } : {})}
      {...props}
    />
  );
}

/**
 * The line under the control: its children are the description, and the Field's error replaces them while there is
 * one. It keeps its place in the DOM while empty, so the control's aria-describedby has something to find.
 */
function FieldHint({ className, children, ...props }: Omit<React.ComponentProps<typeof FieldMessage>, "tone" | "id">) {
  const field = useField("FieldHint");
  const error = field.error;
  return (
    <FieldMessage
      // A new element when an error arrives: an alert is read out as it is inserted, even when its words were the hint's.
      key={error === undefined ? "hint" : "error"}
      id={field.hintId}
      tone={error === undefined ? "default" : "error"}
      role={error === undefined ? undefined : "alert"}
      aria-live={error === undefined ? "polite" : "assertive"}
      className={className}
      {...props}
    >
      {error ?? children}
    </FieldMessage>
  );
}

/**
 * A setting row with a Switch: the name and a line about it on the left, the switch on the right, and the whole row
 * a Field, so the name labels the switch and the line describes it. Every Switch prop reaches the switch; `label` and
 * `description` are the page's words, and `className` styles the row.
 */
function SwitchField({
  label,
  description,
  error,
  id,
  className,
  disabled,
  ...props
}: Omit<React.ComponentProps<typeof Switch>, "aria-label" | "aria-labelledby"> & {
  label: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
}) {
  return (
    <Field id={id} error={error} disabled={disabled} orientation="row" className={className}>
      <FieldLabel>{label}</FieldLabel>
      <FieldHint>{description}</FieldHint>
      <FieldControl>
        <Switch {...props} />
      </FieldControl>
    </Field>
  );
}

export { Field, FieldLabel, FieldControl, FieldHint, SwitchField };
