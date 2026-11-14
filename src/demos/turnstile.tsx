"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTurnstile } from "@/components/ui/use-turnstile";

/* Cloudflare's test key, which always passes; a project passes the key its server gives, or null when the check is off. */
const TEST_SITE_KEY = "1x00000000000000000000AA";

export default function TurnstileDemo() {
  const { mount, status, waiting, guard, reset } = useTurnstile({ siteKey: TEST_SITE_KEY, action: "demo" });
  const [sent, setSent] = useState(0);
  return (
    <form
      className="grid w-full max-w-sm gap-3"
      onSubmit={(event) => {
        guard(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        setSent((count) => count + 1);
        reset();
      }}
    >
      <Input type="email" aria-label="Email" placeholder="name@example.com" />
      <div ref={mount} />
      <Button type="submit" loading={waiting}>
        Subscribe
      </Button>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {sent > 0 ? `Sent ${sent} time${sent === 1 ? "" : "s"}` : `Check: ${status}`}
      </p>
    </form>
  );
}
