"use client";

import { useState } from "react";
import { Tag, TagList } from "@/components/ui/tag";

export default function TagDemo() {
  const [domains, setDomains] = useState(["example.com", "example.org", "mail.example.net"]);
  return (
    <div className="grid w-full max-w-sm gap-4">
      <TagList aria-label={`${domains.length} domains chosen`}>
        {domains.map((domain) => (
          <li key={domain}>
            <Tag
              removeLabel={`Remove ${domain}`}
              onRemove={() => setDomains((current) => current.filter((entry) => entry !== domain))}
            >
              <span className="font-mono">@{domain}</span>
            </Tag>
          </li>
        ))}
      </TagList>
      <TagList aria-label="Tags">
        <li>
          <Tag variant="outline">Read only</Tag>
        </li>
        <li>
          <Tag variant="destructive">gone.example.com</Tag>
        </li>
      </TagList>
    </div>
  );
}
