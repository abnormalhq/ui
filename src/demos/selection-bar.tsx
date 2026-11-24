"use client";

import { useState } from "react";
import { ArchiveIcon, MailOpenIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectionBar } from "@/components/ui/selection-bar";

const messages = [
  { value: "Invoice for November", label: "invoice" },
  { value: "Your weekly digest", label: "digest" },
  { value: "Welcome to the team", label: "welcome" },
  { value: "Server restarted", label: "serverRestarted" },
] as const;

export const defaultCopy = {
  invoice: "Invoice for November",
  digest: "Your weekly digest",
  welcome: "Welcome to the team",
  serverRestarted: "Server restarted",
  selectedMessages: "Selected messages",
  selectAll: "Select all",
  selectedCount: "{count} selected",
  clearSelection: "Clear selection",
  markAsRead: "Mark as read",
  archive: "Archive",
  delete: "Delete",
};

export default function SelectionBarDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const messageValues = messages.map(({ value }) => value);
  const [checked, setChecked] = useState<string[]>([messages[1].value]);
  const clear = () => setChecked([]);
  return (
    <div className="grid w-full max-w-xl gap-2">
      <SelectionBar
        label={copy.selectedMessages}
        selectAllLabel={copy.selectAll}
        selected={checked.length}
        total={messageValues.length}
        onSelectAll={(all) => setChecked(all ? messageValues : [])}
        count={copy.selectedCount.replace("{count}", String(checked.length))}
        clearLabel={copy.clearSelection}
        onClear={clear}
      >
        <Button variant="outline" size="sm" onClick={clear}>
          <MailOpenIcon />
          {copy.markAsRead}
        </Button>
        <Button variant="outline" size="sm" onClick={clear}>
          <ArchiveIcon />
          {copy.archive}
        </Button>
        <Button variant="destructive" size="sm" onClick={clear}>
          <Trash2Icon />
          {copy.delete}
        </Button>
      </SelectionBar>
      <ul className="grid gap-1 px-4 text-sm">
        {messages.map(({ value, label }) => (
          <li key={value} className="flex items-center gap-3 py-1">
            <Checkbox
              aria-label={copy[label]}
              checked={checked.includes(value)}
              onCheckedChange={(next) =>
                setChecked((current) =>
                  next === true ? [...current, value] : current.filter((entry) => entry !== value),
                )
              }
            />
            {copy[label]}
          </li>
        ))}
      </ul>
    </div>
  );
}
