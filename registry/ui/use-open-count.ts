import { useState } from "react";

/*
 * The hook of GuardedDialog. It lives in its own file without "use client": that file exports components only, so a
 * Server Component can hold it, and a hook is called from the Client Component that owns the dialog.
 */

/**
 * Counts how many times a dialog has opened, to key the form inside it: every open starts from a clean draft.
 * The alternative, `open && <Form />`, empties the dialog the instant it starts to close, during the exit animation.
 */
function useOpenCount(open: boolean): number {
  const [count, setCount] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setCount((current) => current + 1);
  }
  return count;
}

export { useOpenCount };
