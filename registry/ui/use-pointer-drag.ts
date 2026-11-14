import { useRef, useState, type PointerEvent } from "react";

/*
 * The pointer drag behind ResizeHandle, in a file without "use client", so a project's own handle (a window's title
 * bar, a splitter of its own) can use it too.
 */

/**
 * One pointer drag on a handle: a press with the primary button, moves, a release. `start` decides whether the press
 * starts a drag and returns what the drag needs, measured once at the press (null to ignore it); `move` and `end` get
 * it back. Only the pointer that started the drag counts.
 * The handle captures the pointer, so the moves and the release still arrive over an iframe or outside the window.
 * When the pointer was already released, or the event is synthetic, setPointerCapture throws; the drag then goes on
 * without capture, working while the pointer stays over the handle, instead of failing.
 * Spread `handlers` on the handle; `dragging` is true while a drag is on, for the cursor or a style.
 */
function usePointerDrag<State>({
  start,
  move,
  end,
}: {
  start: (event: PointerEvent<HTMLElement>) => State | null;
  move: (state: State, event: PointerEvent<HTMLElement>) => void;
  end?: (state: State, event: PointerEvent<HTMLElement>) => void;
}) {
  const drag = useRef<{ pointerId: number; state: State } | null>(null);
  const [dragging, setDragging] = useState(false);

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0 || drag.current) return;
    const state = start(event);
    if (state === null) return;
    drag.current = { pointerId: event.pointerId, state };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // See above: no capture, and the drag still works over the handle.
    }
    // No text selection starting under the pointer, and the focus stays where it was.
    event.preventDefault();
    setDragging(true);
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    const current = drag.current;
    if (current && current.pointerId === event.pointerId) move(current.state, event);
  }

  function finish(event: PointerEvent<HTMLElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    end?.(current.state, event);
  }

  return {
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
      onLostPointerCapture: finish,
    },
  };
}

export { usePointerDrag };
