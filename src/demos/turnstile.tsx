"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTurnstile } from "@/components/ui/use-turnstile";

/* Cloudflare's test key, which always passes; a project passes the key its server gives, or null when the check is off. */
const TEST_SITE_KEY = "1x00000000000000000000AA";

export const defaultCopy = {
  widgetLanguage: "en",
  email: "Email",
  emailPlaceholder: "name@example.com",
  subscribe: "Subscribe",
  sentOne: "Sent {count} time",
  sentMany: "Sent {count} times",
  check: "Check: {status}",
  off: "off",
  pending: "pending",
  ready: "ready",
  failed: "failed",
};

export default function TurnstileDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const { mount, status, waiting, guard, reset } = useTurnstile({
    siteKey: TEST_SITE_KEY,
    action: "demo",
    language: copy.widgetLanguage,
  });
  const [sent, setSent] = useState(0);
  const statusCopy = { off: copy.off, pending: copy.pending, ready: copy.ready, failed: copy.failed };
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
      <Input type="email" aria-label={copy.email} placeholder={copy.emailPlaceholder} />
      <div ref={mount} />
      <Button type="submit" loading={waiting}>
        {copy.subscribe}
      </Button>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {sent > 0
          ? (sent === 1 ? copy.sentOne : copy.sentMany).replace("{count}", String(sent))
          : copy.check.replace("{status}", statusCopy[status])}
      </p>
    </form>
  );
}
