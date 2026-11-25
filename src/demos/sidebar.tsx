"use client";

import {
  ArchiveIcon,
  ClockIcon,
  FileIcon,
  InboxIcon,
  SendIcon,
  SettingsIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/ui/brand-mark";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarMore,
  SidebarNav,
  SidebarSwitcher,
  SidebarToggle,
} from "@/components/ui/sidebar";
import { ThemePicker, type ThemePreference } from "@/components/ui/theme-picker";

export const defaultCopy = {
  system: "System",
  light: "Light",
  dark: "Dark",
  themeLabel: "Theme: {theme}",
  theme: "Theme",
  mail: "Mail",
  calendar: "Calendar",
  contacts: "Contacts",
  main: "Main",
  inbox: "Inbox",
  unread: "12 unread",
  sent: "Sent",
  archive: "Archive",
  snoozed: "Snoozed",
  starred: "Starred",
  drafts: "Drafts",
  more: "More",
  less: "Less",
  team: "Team",
  labels: "Labels",
  work: "Work",
  members: "Members",
  settings: "Settings",
  expand: "Expand sidebar",
  collapse: "Collapse sidebar",
  pageFor: "The page for {section}.",
};

/* A project reads the cookie on the server into defaultCollapsed; here the sidebar starts expanded. */
export default function SidebarDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const themes = { system: copy.system, light: copy.light, dark: copy.dark };
  const [current, setCurrent] = useState<
    "inbox" | "snoozed" | "starred" | "drafts" | "sent" | "archive" | "work" | "members" | "settings"
  >("inbox");
  const [theme, setTheme] = useState<ThemePreference>();
  const row = (id: typeof current) => ({ current: current === id, onClick: () => setCurrent(id) });
  const currentSection = overrides.pageFor ? copy[current] : current;

  return (
    <div className="flex h-[30rem] w-full max-w-xl overflow-hidden rounded-panel border border-border">
      <Sidebar cookieName="sidebar" shortcut="b" className="ink">
        <SidebarHeader>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarSwitcher icon={<BrandMark className="size-5" />} label={copy.mail} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem>
                {copy.mail}
                <DropdownMenuShortcut>⌃1</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                {copy.calendar}
                <DropdownMenuShortcut>⌃2</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                {copy.contacts}
                <DropdownMenuShortcut>⌃3</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarHeader>
        <SidebarNav label={copy.main}>
          <SidebarItem
            icon={<InboxIcon />}
            label={copy.inbox}
            count={12}
            countLabel={copy.unread}
            attention
            {...row("inbox")}
          />
          <SidebarItem icon={<ClockIcon />} label={copy.snoozed} count={3} {...row("snoozed")} />
          <SidebarItem icon={<StarIcon />} label={copy.starred} {...row("starred")} />
          <SidebarMore moreLabel={copy.more} lessLabel={copy.less}>
            <SidebarItem icon={<FileIcon />} label={copy.drafts} count={2} {...row("drafts")} />
            <SidebarItem icon={<SendIcon />} label={copy.sent} {...row("sent")} />
            <SidebarItem icon={<ArchiveIcon />} label={copy.archive} count={1280} {...row("archive")} />
          </SidebarMore>
          <SidebarGroup label={copy.labels}>
            <SidebarItem icon={<TagIcon />} label={copy.work} {...row("work")} />
          </SidebarGroup>
          <SidebarGroup label={copy.team}>
            <SidebarItem icon={<UsersIcon />} label={copy.members} dot {...row("members")} />
            <SidebarItem icon={<SettingsIcon />} label={copy.settings} {...row("settings")} />
          </SidebarGroup>
        </SidebarNav>
        <SidebarFooter>
          <ThemePicker
            value={theme}
            onValueChange={setTheme}
            labels={themes}
            label={theme ? copy.themeLabel.replace("{theme}", themes[theme]) : copy.theme}
            tooltip={copy.theme}
            tooltipSide="right"
            side="top"
            align="start"
          />
          <SidebarToggle
            expandLabel={copy.expand}
            collapseLabel={copy.collapse}
            hint={
              <kbd className="rounded-chip border border-border px-1 font-sans text-xs text-muted-foreground">⌘B</kbd>
            }
          />
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 p-6 text-muted-foreground">{copy.pageFor.replace("{section}", currentSection)}</main>
    </div>
  );
}
