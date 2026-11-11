"use client";

import { useState } from "react";
import { SearchInput } from "@/components/ui/search-input";

export default function SearchInputDemo() {
  const [query, setQuery] = useState("abnormalhq.com");

  return (
    <div className="grid w-full max-w-sm gap-4">
      <SearchInput
        aria-label="Search domains"
        placeholder="Search domains"
        clearLabel="Clear"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <SearchInput
        aria-label="Search mailboxes"
        placeholder="Search mailboxes"
        clearLabel="Clear"
        hint={
          <kbd className="grid h-5 min-w-5 place-items-center rounded-chip border border-border bg-surface px-1 font-sans text-xs text-muted-foreground">
            /
          </kbd>
        }
      />
      <div className="flex items-center gap-2">
        <SearchInput size="sm" aria-label="Small" placeholder="sm, 28px" clearLabel="Clear" />
        <SearchInput size="lg" aria-label="Large" placeholder="lg, 40px" clearLabel="Clear" />
      </div>
      <SearchInput aria-label="Disabled" disabled defaultValue="Disabled" clearLabel="Clear" />
    </div>
  );
}
