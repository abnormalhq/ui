"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

/**
 * A Button that opens the file chooser: the browser's own file input, which cannot be styled, stays hidden next to
 * it, and the button is what the person sees, reaches with the keyboard and hears named by its text.
 * `onFiles` gets the chosen files as an array, never an empty one, for a page that reads them itself (an avatar to
 * upload, a CSV to fill a textarea with). The input is then emptied, so choosing the same file again fires it again.
 * With a `name` the input keeps its files instead and submits them with its form, the way a visible file input would,
 * and a form reset clears them as it does any field.
 * `accept`, `multiple` and `capture` are the file input's own. `disabled` and `loading` apply to both.
 */
function FileButton({
  accept,
  multiple,
  capture,
  name,
  form,
  onFiles,
  disabled,
  loading,
  onClick,
  type = "button",
  ...props
}: React.ComponentProps<typeof Button> & {
  /** The file types to offer, as the file input takes them: ".csv,text/csv", "image/*". */
  accept?: string;
  multiple?: boolean;
  /** On a phone, take a new photo or recording instead of choosing a file. */
  capture?: React.InputHTMLAttributes<HTMLInputElement>["capture"];
  /** The field the files submit as; without it the page reads them in `onFiles`. */
  name?: string;
  /** Called with the files chosen. */
  onFiles?: (files: File[]) => void;
}) {
  const input = React.useRef<HTMLInputElement>(null);
  return (
    <>
      <Button
        type={type}
        data-slot="file-button"
        disabled={disabled}
        loading={loading}
        form={form}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) input.current?.click();
        }}
        {...props}
      />
      <input
        ref={input}
        type="file"
        hidden
        tabIndex={-1}
        aria-hidden="true"
        data-slot="file-button-input"
        accept={accept}
        multiple={multiple}
        capture={capture}
        name={name}
        form={form}
        disabled={disabled || loading}
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          if (name === undefined) event.currentTarget.value = "";
          if (files.length > 0) onFiles?.(files);
        }}
      />
    </>
  );
}

export { FileButton };
