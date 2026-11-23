"use client";

import { DownloadIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ListToolbar,
  ListToolbarActions,
  ListToolbarChips,
  ListToolbarGroup,
  ListToolbarSearch,
} from "@/components/ui/list-toolbar";
import { SearchInput } from "@/components/ui/search-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag } from "@/components/ui/tag";

export const defaultCopy = {
  search: "Search tickets",
  clearSearch: "Clear search",
  status: "Status",
  allStatuses: "All statuses",
  open: "Open",
  closed: "Closed",
  export: "Export",
  add: "New ticket",
  statusChip: "Status: {value}",
  removeChip: "Remove the status condition",
  clearAll: "Clear filters",
};

export default function ListToolbarDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("open");
  return (
    <div className="grid w-full max-w-3xl gap-2">
      <ListToolbar asChild>
        <form role="search" onSubmit={(event) => event.preventDefault()}>
          <ListToolbarSearch>
            <SearchInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onClear={() => setQuery("")}
              aria-label={copy.search}
              placeholder={copy.search}
              clearLabel={copy.clearSearch}
            />
          </ListToolbarSearch>
          <ListToolbarGroup>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger aria-label={copy.status} className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{copy.allStatuses}</SelectItem>
                <SelectItem value="open">{copy.open}</SelectItem>
                <SelectItem value="closed">{copy.closed}</SelectItem>
              </SelectContent>
            </Select>
          </ListToolbarGroup>
          <ListToolbarActions>
            <Button type="button" variant="outline">
              <DownloadIcon />
              {copy.export}
            </Button>
            <Button type="button">
              <PlusIcon />
              {copy.add}
            </Button>
          </ListToolbarActions>
        </form>
      </ListToolbar>
      {status !== "all" && (
        <ListToolbarChips>
          <Tag removeLabel={copy.removeChip} onRemove={() => setStatus("all")}>
            {copy.statusChip.replace("{value}", status === "open" ? copy.open : copy.closed)}
          </Tag>
          <Button type="button" variant="ghost" size="sm" onClick={() => setStatus("all")}>
            {copy.clearAll}
          </Button>
        </ListToolbarChips>
      )}
    </div>
  );
}
