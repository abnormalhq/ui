"use client";

import { DownloadIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ListToolbar,
  ListToolbarActions,
  ListToolbarChips,
  ListToolbarFilter,
  ListToolbarGroup,
  ListToolbarSearch,
} from "@/components/ui/list-toolbar";
import { SearchInput } from "@/components/ui/search-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tag } from "@/components/ui/tag";

export const defaultCopy = {
  search: "Search tickets",
  clearSearch: "Clear search",
  status: "Status",
  allStatuses: "All statuses",
  open: "Open",
  closed: "Closed",
  addFilter: "Add filter",
  assignee: "Assignee",
  priority: "Priority",
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ListToolbarFilter
                  label={copy.status}
                  value={status === "all" ? copy.allStatuses : status === "open" ? copy.open : copy.closed}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup value={status} onValueChange={setStatus}>
                  <DropdownMenuRadioItem value="all">{copy.allStatuses}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="open">{copy.open}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="closed">{copy.closed}</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ListToolbarFilter add label={copy.addFilter}>
                  <PlusIcon aria-hidden="true" />
                </ListToolbarFilter>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>{copy.assignee}</DropdownMenuItem>
                <DropdownMenuItem>{copy.priority}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
