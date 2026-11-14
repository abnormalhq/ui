"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { usePointerDrag } from "@/components/ui/use-pointer-drag";

/**
 * The handle between two panes that sets the size of one of them: the divider between a mail list and the message,
 * the bottom edge of an editor. It is a focusable separator (role="separator") named by `label`, with the size as
 * its value, so it can be found and used without a pointer: the arrow keys across it change the size by `step`, Home
 * and End go to `min` and `max`, and a double-click hands the size back to the layout (`onReset`).
 * `orientation` is the handle's own direction: "vertical" for a bar between two columns, which sets a width, and
 * "horizontal" for a bar between two rows, which sets a height. Moving right or down grows the pane; `reverse` turns
 * that round, for a pane on the far side of the handle.
 * The size is the page's, in pixels: `value` is the one it holds, or null while the layout decides it, and `measure`
 * then reads it from the layout when a drag or a key starts. `onValueChange` follows every move, and may only write a
 * CSS variable so the page does not render each frame; `onValueCommit` comes once a drag ends or a key moved it, for
 * saving the choice. `max` can be a function, measured when a drag or a key starts, for a limit that depends on the
 * space around.
 * The handle is a 9px strip over the boundary, with a hairline that lights up in the focus color on hover, during a
 * drag and when focused from the keyboard; the panes draw their own borders. The page places it, usually absolutely
 * over the edge. `data-dragging` is set during a drag, and `onDraggingChange` lets the page stop iframes from taking
 * the pointer meanwhile.
 */
function ResizeHandle({
  label,
  orientation = "vertical",
  value,
  min = 0,
  max = Infinity,
  step = 16,
  reverse = false,
  measure,
  onValueChange,
  onValueCommit,
  onReset,
  onDraggingChange,
  className,
  onKeyDown,
  onDoubleClick,
  ...props
}: Omit<React.ComponentProps<"div">, "children" | "aria-label" | "onChange" | "role"> & {
  /** The handle's name, such as "Resize the message list". */
  label: string;
  /** "vertical", a bar between columns (a width); "horizontal", a bar between rows (a height). */
  orientation?: "vertical" | "horizontal";
  /** The size in pixels, or null while the layout decides it. */
  value: number | null;
  min?: number;
  /** The largest size, or a function that measures it when a drag or a key starts. */
  max?: number | (() => number);
  /** How far one arrow key moves, in pixels. */
  step?: number;
  /** Moving right or down shrinks the pane instead, for a pane on the left of or above the handle's far side. */
  reverse?: boolean;
  /** Reads the size from the layout while `value` is null. */
  measure?: () => number;
  onValueChange?: (value: number) => void;
  /** The size once a drag ended or a key moved it: the one to save. */
  onValueCommit?: (value: number) => void;
  /** A double-click: give the size back to the layout, such as by setting it to null. */
  onReset?: () => void;
  onDraggingChange?: (dragging: boolean) => void;
}) {
  const vertical = orientation === "vertical";
  const sign = reverse ? -1 : 1;
  const limit = () => (typeof max === "function" ? max() : max);
  const clamp = (size: number, top: number) => Math.round(Math.min(top, Math.max(min, size)));
  const current = () => value ?? measure?.() ?? min;

  const { dragging, handlers } = usePointerDrag({
    start: (event) => {
      onDraggingChange?.(true);
      const size = current();
      return { origin: vertical ? event.clientX : event.clientY, size, top: limit(), last: size, moved: false };
    },
    move: (drag, event) => {
      const position = vertical ? event.clientX : event.clientY;
      const next = clamp(drag.size + sign * (position - drag.origin), drag.top);
      if (next === drag.last) return;
      drag.last = next;
      drag.moved = true;
      onValueChange?.(next);
    },
    end: (drag) => {
      onDraggingChange?.(false);
      if (drag.moved) onValueCommit?.(drag.last);
    },
  });

  const keys: Record<string, (size: number, top: number) => number> = vertical
    ? { ArrowLeft: (size) => size - sign * step, ArrowRight: (size) => size + sign * step }
    : { ArrowUp: (size) => size - sign * step, ArrowDown: (size) => size + sign * step };
  keys.Home = () => min;
  keys.End = (_, top) => top;

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation={orientation}
      aria-valuenow={value ?? undefined}
      aria-valuemin={min}
      aria-valuemax={typeof max === "number" && Number.isFinite(max) ? max : undefined}
      data-slot="resize-handle"
      data-orientation={orientation}
      data-dragging={dragging ? "" : undefined}
      className={cn(
        "group/resize relative z-10 shrink-0 touch-none outline-none select-none",
        vertical ? "-mx-1 w-[9px] cursor-col-resize self-stretch" : "-my-1 h-[9px] w-full cursor-row-resize",
        className,
      )}
      {...props}
      {...handlers}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        const key = keys[event.key];
        if (event.defaultPrevented || !key) return;
        const top = limit();
        // End goes to the largest size there is; with no limit at all it has nowhere to go.
        if (event.key === "End" && !Number.isFinite(top)) return;
        event.preventDefault();
        const next = clamp(key(current(), top), top);
        onValueChange?.(next);
        onValueCommit?.(next);
      }}
      onDoubleClick={(event) => {
        onDoubleClick?.(event);
        if (!event.defaultPrevented) onReset?.();
      }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute bg-transparent transition-colors duration-150 group-hover/resize:bg-ring group-focus-visible/resize:bg-ring group-data-dragging/resize:bg-ring",
          vertical
            ? "inset-y-0 left-1 w-px group-focus-visible/resize:left-[3.5px] group-focus-visible/resize:w-0.5"
            : "inset-x-0 top-1 h-px group-focus-visible/resize:top-[3.5px] group-focus-visible/resize:h-0.5",
        )}
      />
    </div>
  );
}

export { ResizeHandle };
