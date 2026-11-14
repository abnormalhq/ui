"use client";

import { useState } from "react";
import { ArchiveIcon, MailOpenIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectionBar } from "@/components/ui/selection-bar";

const messages = ["Invoice for November", "Your weekly digest", "Welcome to the team", "Server restarted"];

export default function SelectionBarDemo() {
  const [checked, setChecked] = useState<string[]>([messages[1]!]);
  const clear = () => setChecked([]);
  return (
    <div className="grid w-full max-w-xl gap-2">
      <SelectionBar
        label="Selected messages"
        selectAllLabel="Select all"
        selected={checked.length}
        total={messages.length}
        onSelectAll={(all) => setChecked(all ? messages : [])}
        count={`${checked.length} selected`}
        clearLabel="Clear selection"
        onClear={clear}
      >
        <Button variant="outline" size="sm" onClick={clear}>
          <MailOpenIcon />
          Mark as read
        </Button>
        <Button variant="outline" size="sm" onClick={clear}>
          <ArchiveIcon />
          Archive
        </Button>
        <Button variant="destructive" size="sm" onClick={clear}>
          <Trash2Icon />
          Delete
        </Button>
      </SelectionBar>
      <ul className="grid gap-1 px-4 text-sm">
        {messages.map((message) => (
          <li key={message} className="flex items-center gap-3 py-1">
            <Checkbox
              aria-label={message}
              checked={checked.includes(message)}
              onCheckedChange={(next) =>
                setChecked((current) =>
                  next === true ? [...current, message] : current.filter((entry) => entry !== message),
                )
              }
            />
            {message}
          </li>
        ))}
      </ul>
    </div>
  );
}
