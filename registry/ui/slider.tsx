"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Slider as SliderPrimitive } from "radix-ui";

/**
 * A value picked along a track: a quota, a volume, a price limit. The filled part is the signal color (ink in light,
 * yellow in dark), the thumb a paper disc with an ink edge, with a 24px touch area around its 16px.
 * `value` and `defaultValue` are arrays, one number per thumb: one for a single value, two for a range.
 * Arrow keys move a thumb by `step`, Page Up and Page Down by ten steps, Home and End to the ends.
 * Each thumb is the slider to a screen reader, so the name goes there: aria-label or aria-labelledby on a single
 * slider is passed to its thumb, and a range takes `thumbLabels`, one per thumb ("From", "To"). Give a range its
 * labels: without them the primitive falls back to English names of its own. `getValueText` turns a number into
 * what should be read, such as "20 GB".
 * With a name it submits with a form, one field per thumb.
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  thumbLabels,
  getValueText,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  /** The accessible name of each thumb, in order. */
  thumbLabels?: string[];
  /** What a screen reader says for a value, instead of the bare number. */
  getValueText?: (value: number) => string;
}) {
  const values = value ?? defaultValue ?? [min];
  // Uncontrolled, the thumbs still need their current values for aria-valuetext.
  const [current, setCurrent] = React.useState(values);
  const shown = value ?? current;
  const { onValueChange } = props;

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=horizontal]:h-6 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-32 data-[orientation=vertical]:w-6 data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
      onValueChange={(next) => {
        setCurrent(next);
        onValueChange?.(next);
      }}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-signal data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          aria-label={thumbLabels?.[index] ?? ariaLabel}
          aria-labelledby={thumbLabels?.[index] === undefined ? ariaLabelledby : undefined}
          aria-describedby={ariaDescribedby}
          aria-valuetext={getValueText && shown[index] !== undefined ? getValueText(shown[index]) : undefined}
          className="relative block size-4 shrink-0 rounded-full border-[1.5px] border-foreground bg-background transition-[box-shadow,transform] duration-150 after:absolute after:-inset-1 hover:shadow-[0_0_0_4px_var(--control)] active:scale-110 data-disabled:pointer-events-none"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
