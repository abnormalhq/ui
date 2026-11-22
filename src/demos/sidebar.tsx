"use client";

import { ArchiveIcon, InboxIcon, SendIcon, SettingsIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarSeparator,
  SidebarToggle,
} from "@/components/ui/sidebar";
import { ThemePicker, type ThemePreference } from "@/components/ui/theme-picker";

export const defaultCopy = {
  system: "System",
  light: "Light",
  dark: "Dark",
  themeLabel: "Theme: {theme}",
  theme: "Theme",
  main: "Main",
  inbox: "Inbox",
  unread: "12 unread",
  sent: "Sent",
  archive: "Archive",
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
  const [current, setCurrent] = useState<"inbox" | "sent" | "archive" | "members" | "settings">("inbox");
  const [theme, setTheme] = useState<ThemePreference>();
  const row = (id: typeof current) => ({ current: current === id, onClick: () => setCurrent(id) });
  const currentSection = overrides.pageFor ? copy[current] : current;

  return (
    <div className="flex h-96 w-full max-w-xl overflow-hidden rounded-panel border border-border">
      <Sidebar cookieName="sidebar" shortcut="b" className="ink">
        <SidebarHeader>
          <span className="truncate px-3 font-heading text-lg font-semibold">abnormal</span>
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
          <SidebarItem icon={<SendIcon />} label={copy.sent} {...row("sent")} />
          <SidebarItem icon={<ArchiveIcon />} label={copy.archive} count={1280} {...row("archive")} />
          <SidebarSeparator />
          <SidebarItem icon={<UsersIcon />} label={copy.members} dot {...row("members")} />
          <SidebarItem icon={<SettingsIcon />} label={copy.settings} {...row("settings")} />
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
