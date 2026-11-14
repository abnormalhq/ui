"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";
import { type ScrollAxis, useScrollFade, useWheelSideways } from "@/components/ui/use-scroll-fade";

/**
 * A box that scrolls its content under thin bars of its own, the same in every browser and system: a long list in a
 * panel, a message thread, a code sample. The scrolling is the browser's; only the bars are drawn, and they appear
 * while the pointer is over the area or it is scrolling. Give it a height (or a max-height) with a class.
 * A keyboard user must be able to scroll it too. While the content overflows, the viewport is a tab stop, so arrow
 * keys, Page Up, Page Down and Space scroll it; an area that fits adds none. Name it with aria-label or
 * aria-labelledby and it also becomes a region to assistive technology; the component has no words to name it with.
 * `orientation` picks the bars: vertical, horizontal or both.
 * `fade` fades an edge while there is more content past it, so a cut-off row does not look as if it ended there. It
 * is a mask on the scrolling element, so it works over any background.
 * `strip` is a one-line row that scrolls sideways, such as filters above a list: the bar is horizontal, the content
 * keeps its own width on one line, and a vertical mouse wheel scrolls it sideways until an end, then the page again.
 */
function ScrollArea({
  className,
  children,
  orientation: orientationProp = "vertical",
  fade = false,
  strip = false,
  viewportClassName,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  orientation?: "vertical" | "horizontal" | "both";
  /** Fade the edges that have more content past them. */
  fade?: boolean;
  /** A one-line row that scrolls sideways, with a vertical wheel too; the bar is horizontal whatever `orientation` says. */
  strip?: boolean;
  /** Classes for the scrolling element itself, such as padding that should scroll with the content. */
  viewportClassName?: string;
}) {
  const orientation = strip ? "horizontal" : orientationProp;
  const viewport = React.useRef<HTMLDivElement>(null);
  useScrollFade(
    viewport,
    !fade ? null : orientation === "vertical" ? "y" : orientation === "horizontal" ? "x" : "both",
  );
  useWheelSideways(viewport, strip);
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
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      data-strip={strip ? "" : undefined}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewport}
        data-slot="scroll-area-viewport"
        tabIndex={scrollable ? 0 : undefined}
        role={named ? "region" : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        className={cn(
          "size-full rounded-[inherit] focus-visible:-outline-offset-2",
          // Radix wraps the content in a table as wide as the viewport; a strip's is as wide as its content.
          strip && "[&>div]:w-max",
          viewportClassName,
        )}
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

/**
 * A plain element that fades its edges while there is more to scroll to, and with `wheel` lets a vertical mouse wheel
 * scroll it sideways: the browser's own scrolling, without ScrollArea's bars. The page gives it its overflow and
 * layout classes. It suits a row that hides its scrollbar, such as a header's actions on a phone, and a server
 * component's row can take it through asChild (PageHeaderActions with `scroll`).
 */
function ScrollFade({
  axis = "x",
  wheel = false,
  ref,
  ...props
}: React.ComponentProps<"div"> & {
  /** The edges to fade: sideways, up and down, or both. */
  axis?: ScrollAxis;
  /** A vertical wheel scrolls the row sideways. */
  wheel?: boolean;
}) {
  const element = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(ref, () => element.current as HTMLDivElement, []);
  useScrollFade(element, axis);
  useWheelSideways(element, wheel);
  return <div ref={element} data-slot="scroll-fade" {...props} />;
}

export { ScrollArea, ScrollBar, ScrollFade };
