"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  ItemList,
  ItemListContent,
  ItemListDescription,
  ItemListItem,
  ItemListRow,
  ItemListTitle,
} from "@/components/ui/item-list";
import { Kbd } from "@/components/ui/kbd";
import { useListNavigation } from "@/components/ui/use-list-navigation";

export const defaultCopy = {
  search: "Filter mailboxes",
  hint: "Press J and K to move, Enter to open, Esc to let go, / to search.",
  opened: "Opened {name}",
  nothingOpen: "Nothing open",
  billing: "Billing",
  support: "Shared support inbox",
  alerts: "Operations alerts",
  sales: "East sales",
};

const mailboxes = [
  { address: "billing@lumen.example", note: "billing" },
  { address: "support@harbor.example", note: "support" },
  { address: "ops@northwind.example", note: "alerts" },
  { address: "lin.yue@northwind.example", note: "sales" },
] as const;

export default function ListNavigationDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(-1);
  const [opened, setOpened] = useState<string | null>(null);
  const search = useRef<HTMLInputElement>(null);
  const shown = mailboxes.filter(({ address }) => address.includes(query.trim().toLowerCase()));

  useListNavigation({
    count: shown.length,
    index,
    onIndexChange: setIndex,
    onOpen: (current) => setOpened(shown[current]?.address ?? null),
    onClose: () => {
      setIndex(-1);
      setOpened(null);
    },
    searchRef: search,
  });

  return (
    <div className="grid w-full max-w-md gap-3">
      <Input
        ref={search}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIndex(-1);
        }}
        aria-label={copy.search}
        placeholder={copy.search}
      />
      <ItemList>
        {shown.map(({ address, note }, row) => (
          <ItemListItem key={address}>
            <ItemListRow asChild density="compact" selected={row === index}>
              <button
                type="button"
                aria-pressed={row === index}
                onClick={() => {
                  setIndex(row);
                  setOpened(address);
                }}
              >
                <ItemListContent>
                  <ItemListTitle className="font-mono text-xs">{address}</ItemListTitle>
                  <ItemListDescription>{copy[note]}</ItemListDescription>
                </ItemListContent>
              </button>
            </ItemListRow>
          </ItemListItem>
        ))}
      </ItemList>
      <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Kbd>J</Kbd>
        <Kbd>K</Kbd>
        <Kbd>↵</Kbd>
        <Kbd>Esc</Kbd>
        <Kbd>/</Kbd>
        <span>{copy.hint}</span>
      </p>
      <p role="status" className="text-sm">
        {opened ? copy.opened.replace("{name}", opened) : copy.nothingOpen}
      </p>
    </div>
  );
}
