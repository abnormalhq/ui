import { useEffect, type RefObject } from "react";

/*
 * The edge fade and the sideways wheel of a scrolling row, for ScrollArea's `fade` and `strip` and for the row of
 * NavTabs. They live in a file without "use client", so another item, or a project's own row, can call them too.
 */

/** Which way a box scrolls, for the fade: sideways, up and down, or both. */
type ScrollAxis = "x" | "y" | "both";

/** How far the fade reaches into the box, in pixels: enough to read as "there is more this way". */
const FADE = 24;

/** One gradient along an axis, transparent at each end that still has content past it. */
function edgeMask(direction: "right" | "bottom", start: boolean, end: boolean) {
  if (!start && !end) return null;
  const from = start ? `transparent, #000 ${FADE}px` : "#000";
  const to = end ? `#000 calc(100% - ${FADE}px), transparent` : "#000";
  return `linear-gradient(to ${direction}, ${from}, ${to})`;
}

/**
 * Fades the edges of a scrolling box where content is hidden: the end while there is more past it, the start once the
 * box has been scrolled. A box that fits shows no fade. It is a mask, so it works over any background (a translucent
 * sticky bar included), and it is written straight onto the element's style, so scrolling never re-renders it.
 * Pass `null` as the axis to turn it off.
 */
function useScrollFade(ref: RefObject<HTMLElement | null>, axis: ScrollAxis | null = "x") {
  useEffect(() => {
    const element = ref.current;
    if (!element || axis === null) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      // Rounding of fractional sizes leaves a pixel or so at either end.
      const x =
        axis === "y"
          ? null
          : edgeMask(
              "right",
              element.scrollLeft > 1,
              element.scrollWidth - element.clientWidth - element.scrollLeft > 1,
            );
      const y =
        axis === "x"
          ? null
          : edgeMask(
              "bottom",
              element.scrollTop > 1,
              element.scrollHeight - element.clientHeight - element.scrollTop > 1,
            );
      const masks = [x, y].filter((mask) => mask !== null);
      element.style.maskImage = masks.join(", ");
      // Two masks show only where both do: each fades its own edges and leaves the rest of the box alone.
      element.style.maskComposite = masks.length > 1 ? "intersect" : "";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    element.addEventListener("scroll", schedule, { passive: true });
    // The box's own size (the window, a sidebar collapsing) and its content (a count arriving, the language) both change
    // what is hidden.
    const resized = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(schedule);
    resized?.observe(element);
    for (const child of element.children) resized?.observe(child);
    const changed = typeof MutationObserver === "undefined" ? undefined : new MutationObserver(schedule);
    changed?.observe(element, { childList: true, subtree: true, characterData: true });
    return () => {
      element.removeEventListener("scroll", schedule);
      resized?.disconnect();
      changed?.disconnect();
      if (frame) cancelAnimationFrame(frame);
      element.style.maskImage = "";
      element.style.maskComposite = "";
    };
  }, [ref, axis]);
}

/**
 * Lets a vertical mouse wheel scroll a one-line row sideways, since a mouse has no horizontal wheel. A trackpad already
 * scrolls it, and a gesture that is mostly sideways, or a pinch (ctrlKey), is left alone. At either end the wheel goes
 * back to scrolling the page, so the row never traps it. Pass `false` to turn it off.
 */
function useWheelSideways(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const max = element.scrollWidth - element.clientWidth;
      if (max <= 0) return;
      if ((event.deltaY < 0 && element.scrollLeft <= 0) || (event.deltaY > 0 && element.scrollLeft >= max)) return;
      event.preventDefault();
      element.scrollLeft += event.deltaY;
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [ref, enabled]);
}

/**
 * Brings `item` into view inside the row `container` scrolls, centred, without moving the page: an item already in view
 * stays where it is. For the current tab of a row narrower than its tabs.
 */
function scrollIntoRow(container: HTMLElement, item: HTMLElement, behavior: ScrollBehavior = "auto") {
  const box = container.getBoundingClientRect();
  const rect = item.getBoundingClientRect();
  const left = rect.left - box.left + container.scrollLeft;
  if (left >= container.scrollLeft && left + rect.width <= container.scrollLeft + container.clientWidth) return;
  container.scrollTo({ left: left - container.clientWidth / 2 + rect.width / 2, behavior });
}

export { useScrollFade, useWheelSideways, scrollIntoRow, type ScrollAxis };
