import { createContext, useContext, useSyncExternalStore } from "react";

/*
 * The hook of Kbd. It lives in its own file without "use client", so kbd.tsx stays a file a Server Component can render, and the hook is
 * called from the Client Component that shows the shortcut. ModifierKeyProvider (modifier-key-provider.tsx) tells it the platform from the
 * request, for the server's render.
 */

type ModifierKey = "meta" | "control";

const subscribe = () => () => {};

// ⌘ on a Mac, an iPhone or an iPad, Ctrl elsewhere: from the browser's user agent, which the request's User-Agent header repeats.
const modifierOf = (userAgent: string): ModifierKey => (/Mac|iPhone|iPad/.test(userAgent) ? "meta" : "control");

// What the server told from the request (ModifierKeyProvider), for the server's render and hydration; null where no provider is given.
const ServerModifierKey = createContext<ModifierKey | null>(null);

/**
 * Which modifier the platform's shortcuts use: `"meta"` (⌘) on a Mac, an iPhone or an iPad, `"control"` elsewhere. On the server and
 * during hydration it is what ModifierKeyProvider told from the request, or `null` without one, when the platform is not known yet: the
 * page then picks a stand-in for `null` so the first paint has a key. The page turns it into the printed name in its own language
 * (⌘, Ctrl, Strg).
 */
function useModifierKey(): ModifierKey | null {
  const fromRequest = useContext(ServerModifierKey);
  return useSyncExternalStore(
    subscribe,
    () => modifierOf(navigator.userAgent),
    () => fromRequest,
  );
}

export { modifierOf, ServerModifierKey, useModifierKey };
export type { ModifierKey };
