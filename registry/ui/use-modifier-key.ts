import { useSyncExternalStore } from "react";

/*
 * The hook of Kbd. It lives in its own file without "use client", so kbd.tsx stays a file a Server Component can render,
 * and the hook is called from the Client Component that shows the shortcut.
 */

const subscribe = () => () => {};

/**
 * Which modifier the platform's shortcuts use: `"meta"` (⌘) on a Mac, an iPhone or an iPad, `"control"` elsewhere,
 * and `null` on the server and during hydration, when the platform is not known yet. The page turns it into the
 * printed name in its own language (⌘, Ctrl, Strg), and picks a stand-in for `null` so the first paint has a key.
 */
function useModifierKey(): "meta" | "control" | null {
  return useSyncExternalStore(
    subscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? "meta" : "control"),
    () => null,
  );
}

export { useModifierKey };
