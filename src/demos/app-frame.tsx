"use client";

import { ArchiveIcon, CalendarIcon, CheckSquareIcon, ClockIcon, InboxIcon, SendIcon, StarIcon } from "lucide-react";
import { useState } from "react";
import {
  AppFrame,
  AppFrameBody,
  AppFrameColumn,
  AppFrameDock,
  AppFrameSheet,
  AppFrameSheetBar,
  AppFrameSheetHeader,
  AppFrameSheetTitle,
} from "@/components/ui/app-frame";
import { BrandMark } from "@/components/ui/brand-mark";
import { Button } from "@/components/ui/button";
import {
  CardList,
  CardListCard,
  CardListDot,
  CardListHeader,
  CardListItem,
  CardListLine,
  CardListMeta,
  CardListPreview,
  CardListTitle,
} from "@/components/ui/card-list";
import { Sidebar, SidebarHeader, SidebarItem, SidebarNav, SidebarSwitcher } from "@/components/ui/sidebar";
import { StatusBar, StatusBarItem, StatusBarShortcut, StatusBarSpacer } from "@/components/ui/status-bar";
import { Tag } from "@/components/ui/tag";
import { Textarea } from "@/components/ui/textarea";
import { Toolbar, ToolbarButton } from "@/components/ui/toolbar";

export const defaultCopy = {
  mail: "Mail",
  folders: "Folders",
  inbox: "Inbox",
  snoozed: "Snoozed",
  starred: "Starred",
  sent: "Sent",
  conversations: "Conversations",
  reviewFrom: "Lin Shu",
  reviewTime: "09:12",
  reviewSubject: "Wednesday's review moves to 3 PM",
  reviewPreview: "Hi all, the design review moves to the afternoon.",
  renewalFrom: "Cloudflare",
  renewalTime: "08:40",
  renewalSubject: "Your domain renewed",
  renewalPreview: "The invoice went to the billing address.",
  archive: "Archive",
  work: "Work",
  people: "Lin Shu, you and 3 others",
  body: "Hi all, the design review on Wednesday morning moves to 3 PM. The room stays the same.",
  reply: "Reply to Lin Shu",
  replyPlaceholder: "Reply to Lin Shu…",
  send: "Send",
  tools: "Tools",
  calendar: "Calendar",
  tasks: "Tasks",
  synced: "Synced",
  move: "Move",
  commands: "Commands",
};

/*
 * The frame of a product: the sidebar and the list sit on the canvas, the open conversation is the one sheet, a tool
 * rail runs down the right and the status bar along the bottom. A page gives the frame h-dvh; here it has a fixed height.
 */
export default function AppFrameDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [tool, setTool] = useState<"calendar" | "tasks" | null>(null);
  return (
    <AppFrame className="h-[30rem] w-full overflow-hidden rounded-panel border border-border">
      <AppFrameBody className="ps-0">
        <Sidebar className="h-auto py-1.5">
          <SidebarHeader className="pb-2">
            <SidebarSwitcher icon={<BrandMark className="size-5" />} label={copy.mail} />
          </SidebarHeader>
          <SidebarNav label={copy.folders}>
            <SidebarItem icon={<InboxIcon />} label={copy.inbox} count={12} current />
            <SidebarItem icon={<ClockIcon />} label={copy.snoozed} count={3} />
            <SidebarItem icon={<StarIcon />} label={copy.starred} />
            <SidebarItem icon={<SendIcon />} label={copy.sent} />
          </SidebarNav>
        </Sidebar>
        <AppFrameColumn asChild className="hidden w-64 overflow-y-auto lg:flex">
          <section aria-label={copy.conversations}>
            <CardList>
              <CardListItem>
                <CardListCard asChild selected>
                  <a href="#review" aria-current="true">
                    <CardListHeader>
                      <CardListTitle>{copy.reviewFrom}</CardListTitle>
                      <CardListMeta>{copy.reviewTime}</CardListMeta>
                    </CardListHeader>
                    <CardListLine>{copy.reviewSubject}</CardListLine>
                    <CardListPreview>{copy.reviewPreview}</CardListPreview>
                  </a>
                </CardListCard>
              </CardListItem>
              <CardListItem>
                <CardListCard asChild unread>
                  <a href="#renewal">
                    <CardListHeader>
                      <CardListDot />
                      <CardListTitle>{copy.renewalFrom}</CardListTitle>
                      <CardListMeta>{copy.renewalTime}</CardListMeta>
                    </CardListHeader>
                    <CardListLine>{copy.renewalSubject}</CardListLine>
                    <CardListPreview>{copy.renewalPreview}</CardListPreview>
                  </a>
                </CardListCard>
              </CardListItem>
            </CardList>
          </section>
        </AppFrameColumn>
        <AppFrameSheet asChild>
          <article aria-labelledby="app-frame-demo-title">
            <AppFrameSheetHeader>
              <AppFrameSheetTitle id="app-frame-demo-title">{copy.reviewSubject}</AppFrameSheetTitle>
              <Button variant="outline" size="sm">
                <ArchiveIcon />
                {copy.archive}
              </Button>
            </AppFrameSheetHeader>
            <AppFrameSheetBar>
              <Tag>{copy.work}</Tag>
              <span>{copy.people}</span>
            </AppFrameSheetBar>
            <p className="max-w-prose flex-1 overflow-y-auto p-4 text-sm">{copy.body}</p>
            <AppFrameDock>
              <Textarea
                aria-label={copy.reply}
                placeholder={copy.replyPlaceholder}
                className="min-h-10 resize-none border-0 bg-transparent p-1 hover:border-0"
              />
              <Button size="sm" className="self-end">
                {copy.send}
              </Button>
            </AppFrameDock>
          </article>
        </AppFrameSheet>
        <AppFrameColumn className="hidden md:flex">
          <Toolbar label={copy.tools} orientation="vertical">
            <ToolbarButton
              aria-label={copy.calendar}
              pressed={tool === "calendar"}
              onClick={() => setTool(tool === "calendar" ? null : "calendar")}
            >
              <CalendarIcon />
            </ToolbarButton>
            <ToolbarButton
              aria-label={copy.tasks}
              pressed={tool === "tasks"}
              onClick={() => setTool(tool === "tasks" ? null : "tasks")}
            >
              <CheckSquareIcon />
            </ToolbarButton>
          </Toolbar>
        </AppFrameColumn>
      </AppFrameBody>
      <StatusBar>
        <StatusBarItem>{copy.synced}</StatusBarItem>
        <StatusBarSpacer />
        <StatusBarShortcut keys={["J", "K"]}>{copy.move}</StatusBarShortcut>
        <StatusBarShortcut keys={["⌘", "K"]}>{copy.commands}</StatusBarShortcut>
      </StatusBar>
    </AppFrame>
  );
}
