"use client";

import { useId, useState } from "react";
import { BrandMark } from "@/components/ui/brand-mark";
import {
  ItemList,
  ItemListContent,
  ItemListDescription,
  ItemListItem,
  ItemListMeta,
  ItemListRow,
  ItemListTitle,
} from "@/components/ui/item-list";
import { Workspace, WorkspaceNavigation, WorkspacePane } from "@/components/ui/workspace";

const messages = [
  {
    id: "plan",
    sender: "Chen",
    subject: "Next week's plan",
    preview: "Keep the important things in focus.",
    time: "10:07",
    body: "The plan is ready. Let's start with the most important work and leave room for the details. The notes are attached to our next review; there is no need for another dashboard.",
  },
  {
    id: "journal",
    sender: "Design journal",
    subject: "A quieter workspace",
    preview: "Good tools leave room for the content.",
    time: "09:23",
    body: "A useful interface does not have to compete for attention. Keep navigation clear, let the reading surface breathe, and bring tools forward only when they help the task at hand.",
  },
  {
    id: "book",
    sender: "Lin",
    subject: "Reading group notes",
    preview: "A short note before we meet.",
    time: "Yesterday",
    body: "Here are the notes from our last reading group. We will discuss the next chapter together. Thanks for making time to read, think and share.",
  },
] as const;

/** A working composition example, not a connection to a mailbox. Selection uses the installed list API. */
export function ReadingPreview() {
  const [selected, setSelected] = useState<string>(messages[0].id);
  const message = messages.find(({ id }) => id === selected) ?? messages[0];
  const readerId = useId();
  const headingId = useId();
  return (
    <Workspace>
      <WorkspaceNavigation className="md:w-32">
        <div className="flex items-center gap-2 font-semibold">
          <BrandMark className="size-6" /> Mail
        </div>
        <p className="rounded-control bg-highlight px-2 py-1.5 font-medium text-highlight-foreground">Inbox</p>
        <p className="mt-auto text-xs text-muted-foreground">Sample workspace</p>
      </WorkspaceNavigation>
      <WorkspacePane padding="none" className="md:w-52 md:flex-none">
        <h3 className="px-3 pt-4 pb-3 font-semibold">
          Inbox <span className="text-xs font-normal text-muted-foreground">· 3 messages</span>
        </h3>
        <ItemList aria-label="Example messages" className="rounded-none border-0">
          {messages.map((item) => (
            <ItemListItem key={item.id}>
              <ItemListRow asChild density="compact" selected={message.id === item.id}>
                <button
                  type="button"
                  aria-pressed={message.id === item.id}
                  aria-controls={readerId}
                  onClick={() => setSelected(item.id)}
                >
                  <ItemListContent>
                    <ItemListTitle>{item.sender}</ItemListTitle>
                    <span className="truncate text-sm">{item.subject}</span>
                    <ItemListDescription>{item.preview}</ItemListDescription>
                  </ItemListContent>
                  <ItemListMeta className="self-start text-2xs">{item.time}</ItemListMeta>
                </button>
              </ItemListRow>
            </ItemListItem>
          ))}
        </ItemList>
      </WorkspacePane>
      <WorkspacePane asChild>
        <article id={readerId} aria-labelledby={headingId} className="min-h-72 gap-4">
          <header className="border-b border-border pb-4">
            <h3 id={headingId} className="font-heading text-xl font-semibold text-pretty wrap-anywhere">
              {message.subject}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              From {message.sender} · {message.time}
            </p>
          </header>
          <p className="max-w-prose leading-prose">{message.body}</p>
        </article>
      </WorkspacePane>
    </Workspace>
  );
}
