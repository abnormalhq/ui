import "./dom.ts";
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";

/** Mounts a tree into document.body; unmount it at the end of the test so portals and timers go away with it. */
export async function render(ui: ReactNode) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(ui));
  return {
    container,
    rerender: (next: ReactNode) => act(async () => root.render(next)),
    unmount: async () => {
      await act(async () => root.unmount());
      container.remove();
    },
  };
}

/** A real click: React listens on the root, so the event has to bubble. */
export async function click(element: Element, init: MouseEventInit = {}) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init }));
  });
}
