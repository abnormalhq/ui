"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";

/**
 * A box that scrolls its content under thin bars of its own, the same in every browser and system: a long list in a
 * panel, a message thread, a code sample. The scrolling is the browser's; only the bars are drawn, and they appear
 * while the pointer is over the area or it is scrolling. Give it a height (or a max-height) with a class.
 * A keyboard user must be able to scroll it too. While the content overflows, the viewport is a tab stop, so arrow
 * keys, Page Up, Page Down and Space scroll it; an area that fits adds none. Name it with aria-label or
 * aria-labelledby and it also becomes a region to assistive technology; the component has no words to name it with.
 * `orientation` picks the bars: vertical, horizontal or both.
 */
function ScrollArea({
  className,
  children,
  orientation = "vertical",
  viewportClassName,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  orientation?: "vertical" | "horizontal" | "both";
  /** Classes for the scrolling element itself, such as padding that should scroll with the content. */
  viewportClassName?: string;
}) {
  const viewport = React.useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = React.useState(false);

  React.useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const measure = () =>
      setScrollable(element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth);
    measure();
    // The viewport changes with the layout, its content with the data.
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    observer?.observe(element);
    if (element.firstElementChild) observer?.observe(element.firstElementChild);
    element.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer?.disconnect();
      element.removeEventListener("scroll", measure);
    };
  }, []);

  const named = ariaLabel !== undefined || ariaLabelledby !== undefined;
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" className={cn("relative overflow-hidden", className)} {...props}>
      <ScrollAreaPrimitive.Viewport
        ref={viewport}
        data-slot="scroll-area-viewport"
        tabIndex={scrollable ? 0 : undefined}
        role={named ? "region" : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        className={cn("size-full rounded-[inherit] focus-visible:-outline-offset-2", viewportClassName)}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {orientation !== "horizontal" && <ScrollBar orientation="vertical" />}
      {orientation !== "vertical" && <ScrollBar orientation="horizontal" />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

/** A bar. ScrollArea places its own; this is exported for a layout that needs one with other classes. */
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-0.5 transition-opacity duration-150 select-none data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 data-[state=hidden]:animate-fade-out data-[state=visible]:animate-fade-in",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-muted-foreground/40 transition-colors duration-150 hover:bg-muted-foreground/70"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };
