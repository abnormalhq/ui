"use client";

import type { ReactNode } from "react";
import { modifierOf, ServerModifierKey } from "@/components/ui/use-modifier-key";

/**
 * Lets the server render the platform's modifier instead of a stand-in: given the request's User-Agent header, useModifierKey answers
 * with the same key on the server, during hydration and after it, so a hint such as "⌘K" does not change to "Ctrl K" once the page
 * hydrates. Put it in a layout or page that is dynamic anyway (reading the header makes it so).
 */
function ModifierKeyProvider({ userAgent, children }: { userAgent: string | null | undefined; children?: ReactNode }) {
  return <ServerModifierKey value={userAgent ? modifierOf(userAgent) : null}>{children}</ServerModifierKey>;
}

export { ModifierKeyProvider };
