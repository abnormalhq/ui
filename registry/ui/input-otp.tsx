"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFormReset } from "@/components/ui/use-form-reset";

const ACCEPT = {
  numeric: { pattern: "[0-9]*", inputMode: "numeric", reject: /[^0-9]/g },
  alphanumeric: { pattern: "[A-Za-z0-9]*", inputMode: "text", reject: /[^A-Za-z0-9]/g },
} as const;

/**
 * A one-time code, such as the six digits of two-factor sign-in: a row of boxes that is one real text field.
 * One field, not six, is what makes it work everywhere: a screen reader meets a single input with one name and
 * reads the code back as a whole, the browser and the phone offer the code from a message (autocomplete is
 * one-time-code), a password manager fills it, and a paste lands in one place. The boxes are a picture of that
 * field's value and are hidden from assistive technology.
 * A paste replaces the code, and spaces, dashes and anything else that is not part of a code are dropped, so
 * "123 456" and "123-456" both fit. Typing appends and Backspace removes the last character; the caret stays at the
 * end, which is where the lit box shows it.
 * Name it as any input: a Label with htmlFor, aria-label or aria-labelledby. It takes aria-invalid and
 * aria-describedby, submits under its `name`, and `onComplete` fires when the last box is filled.
 * A form reset treats it as a text field: an uncontrolled one goes back to its defaultValue, without calling
 * onValueChange, unless the page cancels the reset; a controlled one keeps its value prop. React writes the typed code
 * into the input's value attribute, which is what a browser resets to, so the field follows the reset itself.
 * No package is behind it: the field is small enough to own, and the alternatives either draw one input per box or
 * speak English labels of their own.
 */
function InputOTP({
  length = 6,
  accept = "numeric",
  groupSize,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onComplete,
  className,
  disabled,
  onFocus,
  onBlur,
  onPaste,
  onSelect,
  ref,
  ...props
}: Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "maxLength" | "pattern" | "inputMode" | "size" | "accept"
> & {
  /** How many characters the code has. */
  length?: number;
  /** Digits only, or digits and letters. */
  accept?: keyof typeof ACCEPT;
  /** Boxes per group, with a gap between groups: 3 draws a six-digit code as 3 + 3. */
  groupSize?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called once the code has all its characters, with the code. */
  onComplete?: (value: string) => void;
}) {
  const { pattern, inputMode, reject } = ACCEPT[accept];
  const clean = (text: string) => text.replace(reject, "").slice(0, length);
  const [inner, setInner] = React.useState(() => clean(defaultValue));
  const value = valueProp === undefined ? inner : clean(valueProp);
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);
  useFormReset(inputRef, () => setInner(clean(defaultValue)));
  const [focused, setFocused] = React.useState(false);

  const change = (next: string) => {
    if (next === value) return;
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
    if (next.length === length) onComplete?.(next);
  };
  const caretToEnd = (input: HTMLInputElement) => {
    const end = input.value.length;
    if (input.selectionStart !== end || input.selectionEnd !== end) input.setSelectionRange(end, end);
  };

  // The box that takes the next character; the last one once the code is full.
  const active = Math.min(value.length, length - 1);
  return (
    <div
      data-slot="input-otp"
      data-disabled={disabled || undefined}
      className={cn("group/otp relative inline-flex w-fit items-center gap-2 data-disabled:opacity-50", className)}
    >
      <div aria-hidden="true" className="flex items-center gap-2">
        {Array.from({ length }, (_, index) => (
          <div
            key={index}
            data-slot="input-otp-slot"
            data-active={(focused && index === active) || undefined}
            data-filled={index < value.length || undefined}
            className={cn(
              "relative grid h-10 w-9 place-items-center rounded-control border border-input bg-control font-mono text-lg font-medium text-foreground transition-[border-color] duration-150 group-has-[[aria-invalid=true]]/otp:border-destructive data-active:border-[color-mix(in_oklab,var(--input),var(--text)_30%)] data-active:outline-2 data-active:-outline-offset-1 data-active:outline-ring",
              groupSize && index > 0 && index % groupSize === 0 && "ml-2",
            )}
          >
            {value[index]}
            {focused && index === value.length && <span className="absolute h-4 w-px animate-pulse bg-foreground" />}
          </div>
        ))}
      </div>
      <input
        data-slot="input-otp-input"
        type="text"
        inputMode={inputMode}
        pattern={pattern}
        autoComplete="one-time-code"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        disabled={disabled}
        value={value}
        // 16px, so iOS does not zoom the page on focus. The text and the caret are drawn by the boxes instead.
        className="absolute inset-0 size-full cursor-text rounded-control bg-transparent font-mono text-lg text-transparent caret-transparent outline-none selection:bg-transparent selection:text-transparent disabled:cursor-not-allowed"
        onChange={(event) => change(clean(event.target.value))}
        onPaste={(event) => {
          onPaste?.(event);
          if (event.defaultPrevented || event.currentTarget.readOnly) return;
          // A pasted code is the whole code: it replaces what is there instead of being appended to a full field.
          const pasted = clean(event.clipboardData.getData("text"));
          event.preventDefault();
          if (pasted) change(pasted);
        }}
        onSelect={(event) => {
          onSelect?.(event);
          caretToEnd(event.currentTarget);
        }}
        onFocus={(event) => {
          onFocus?.(event);
          setFocused(true);
          caretToEnd(event.currentTarget);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          setFocused(false);
        }}
        {...props}
        ref={inputRef}
      />
    </div>
  );
}

export { InputOTP };
