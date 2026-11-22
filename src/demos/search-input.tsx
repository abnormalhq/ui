"use client";

import { useState } from "react";
import { SearchInput } from "@/components/ui/search-input";

export const defaultCopy = {
  searchDomains: "Search domains",
  searchMailboxes: "Search mailboxes",
  clear: "Clear",
  small: "Small",
  large: "Large",
  smallPlaceholder: "sm, 28px",
  largePlaceholder: "lg, 40px",
  disabled: "Disabled",
};

export default function SearchInputDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [query, setQuery] = useState("abnormalhq.com");

  return (
    <div className="grid w-full max-w-sm gap-4">
      <SearchInput
        aria-label={copy.searchDomains}
        placeholder={copy.searchDomains}
        clearLabel={copy.clear}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <SearchInput
        aria-label={copy.searchMailboxes}
        placeholder={copy.searchMailboxes}
        clearLabel={copy.clear}
        hint={
          <kbd className="grid h-5 min-w-5 place-items-center rounded-chip border border-border bg-surface px-1 font-sans text-xs text-muted-foreground">
            /
          </kbd>
        }
      />
      <div className="flex items-center gap-2">
        <SearchInput size="sm" aria-label={copy.small} placeholder={copy.smallPlaceholder} clearLabel={copy.clear} />
        <SearchInput size="lg" aria-label={copy.large} placeholder={copy.largePlaceholder} clearLabel={copy.clear} />
      </div>
      <SearchInput aria-label={copy.disabled} disabled defaultValue="Disabled" clearLabel={copy.clear} />
    </div>
  );
}
