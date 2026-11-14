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

const themes = { system: "System", light: "Light", dark: "Dark" };

/* A project reads the cookie on the server into defaultCollapsed; here the sidebar starts expanded. */
export default function SidebarDemo() {
  const [current, setCurrent] = useState("inbox");
  const [theme, setTheme] = useState<ThemePreference>();
  const row = (id: string) => ({ current: current === id, onClick: () => setCurrent(id) });

  return (
    <div className="flex h-96 w-full max-w-xl overflow-hidden rounded-panel border border-border">
      <Sidebar cookieName="sidebar" shortcut="b" className="ink">
        <SidebarHeader>
          <span className="truncate px-3 font-heading text-lg font-semibold">abnormal</span>
        </SidebarHeader>
        <SidebarNav label="Main">
          <SidebarItem
            icon={<InboxIcon />}
            label="Inbox"
            count={12}
            countLabel="12 unread"
            attention
            {...row("inbox")}
          />
          <SidebarItem icon={<SendIcon />} label="Sent" {...row("sent")} />
          <SidebarItem icon={<ArchiveIcon />} label="Archive" count={1280} {...row("archive")} />
          <SidebarSeparator />
          <SidebarItem icon={<UsersIcon />} label="Members" dot {...row("members")} />
          <SidebarItem icon={<SettingsIcon />} label="Settings" {...row("settings")} />
        </SidebarNav>
        <SidebarFooter>
          <ThemePicker
            value={theme}
            onValueChange={setTheme}
            labels={themes}
            label={theme ? `Theme: ${themes[theme]}` : "Theme"}
            tooltip="Theme"
            tooltipSide="right"
            side="top"
            align="start"
          />
          <SidebarToggle
            expandLabel="Expand sidebar"
            collapseLabel="Collapse sidebar"
            hint={
              <kbd className="rounded-chip border border-border px-1 font-sans text-xs text-muted-foreground">⌘B</kbd>
            }
          />
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 p-6 text-muted-foreground">The page for {current}.</main>
    </div>
  );
}
