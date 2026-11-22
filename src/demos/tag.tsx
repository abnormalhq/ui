"use client";

import { useState } from "react";
import { Tag, TagList } from "@/components/ui/tag";

export const defaultCopy = {
  domainsChosen: "{count} domains chosen",
  removeDomain: "Remove {domain}",
  tags: "Tags",
  readOnly: "Read only",
};

export default function TagDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [domains, setDomains] = useState(["example.com", "example.org", "mail.example.net"]);
  return (
    <div className="grid w-full max-w-sm gap-4">
      <TagList aria-label={copy.domainsChosen.replace("{count}", String(domains.length))}>
        {domains.map((domain) => (
          <li key={domain}>
            <Tag
              removeLabel={copy.removeDomain.replace("{domain}", domain)}
              onRemove={() => setDomains((current) => current.filter((entry) => entry !== domain))}
            >
              <span className="font-mono">@{domain}</span>
            </Tag>
          </li>
        ))}
      </TagList>
      <TagList aria-label={copy.tags}>
        <li>
          <Tag variant="outline">{copy.readOnly}</Tag>
        </li>
        <li>
          <Tag variant="destructive">gone.example.com</Tag>
        </li>
      </TagList>
    </div>
  );
}
