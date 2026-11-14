import { createContext, useContext } from "react";

/*
 * The sidebar's state, in a file without "use client": a project's own row, menu or drawer inside a sidebar reads it
 * with useSidebar, and Sidebar and SidebarProvider (sidebar.tsx) provide it.
 */

type SidebarState = {
  /** The sidebar is the narrow icon rail. */
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
  /** The letter that toggles it with ⌘ or Ctrl, when the page gave one. */
  shortcut: string | undefined;
};

/** Outside any sidebar the state is expanded and cannot change, so a row written for both places works in either. */
const SidebarContext = createContext<SidebarState | null>(null);

const expanded: SidebarState = { collapsed: false, setCollapsed: () => {}, toggle: () => {}, shortcut: undefined };

/**
 * Whether the sidebar around this component is collapsed to its icon rail, and how to change it. Outside a sidebar
 * it reads as expanded.
 */
function useSidebar(): SidebarState {
  return useContext(SidebarContext) ?? expanded;
}

export { SidebarContext, useSidebar, type SidebarState };
