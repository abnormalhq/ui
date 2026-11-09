"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

export type NavGroup = { title: string; items: { name: string; title: string }[] };

function NavLink({ href, label, onNavigate }: { href: string; label: string; onNavigate?: () => void }) {
  const current = usePathname() === href;
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "block rounded-chip px-2 py-1 text-base transition-colors duration-150",
        current
          ? "bg-highlight font-medium text-highlight-foreground"
          : "text-muted-foreground hover:bg-control hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

const shortTitle = (title: string) => title.replace(/^Abnormal /, "");

export function SiteNav({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  const [query, setQuery] = useState("");
  const resultsId = useId();
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  // Every word has to appear in the item's name or its group, so "menu over" finds the overlay menus.
  const matches = (group: NavGroup, item: NavGroup["items"][number]) =>
    words.every((word) => `${shortTitle(item.title)} ${item.name} ${group.title}`.toLowerCase().includes(word));
  const shown = groups
    .map((group) => ({ ...group, items: group.items.filter((item) => matches(group, item)) }))
    .filter((group) => group.items.length > 0);
  const count = shown.reduce((total, group) => total + group.items.length, 0);

  return (
    <nav aria-label="Components" className="grid gap-6">
      <div className="grid gap-2">
        <InputGroup size="sm">
          <SearchIcon aria-hidden="true" className="ml-2.5 size-3.5 shrink-0 text-muted-foreground" />
          <InputGroupInput
            type="search"
            aria-label="Search components"
            aria-controls={resultsId}
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-2 text-sm"
          />
        </InputGroup>
        {words.length > 0 && (
          <p role="status" className="px-2 text-xs text-muted-foreground">
            {count === 0 ? "No matches" : `${count} ${count === 1 ? "match" : "matches"}`}
          </p>
        )}
      </div>
      <div id={resultsId} className="grid gap-6">
        {words.length === 0 && <NavLink href="/" label="Overview" onNavigate={onNavigate} />}
        {shown.map((group) => (
          <div key={group.title} className="grid gap-1">
            <h2 className="px-2 pb-1 text-xs font-medium text-muted-foreground">{group.title}</h2>
            {group.items.map((item) => (
              <NavLink
                key={item.name}
                href={`/components/${item.name}`}
                label={shortTitle(item.title)}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
