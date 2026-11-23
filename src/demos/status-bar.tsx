import { BookOpenIcon } from "lucide-react";
import {
  StatusBar,
  StatusBarItem,
  StatusBarSeparator,
  StatusBarShortcut,
  StatusBarSpacer,
} from "@/components/ui/status-bar";
import { statusDotVariants } from "@/components/ui/status-label";

export const defaultCopy = {
  docs: "/docs",
  connected: "3 servers online",
  queue: "Queue 12",
  delivered: "Delivered today 18,402",
  move: "Move",
  open: "Open",
  commands: "Commands",
};

/* The strip continues an ink navigation column, so it carries `ink`; on paper it would be the page's own colors. */
export default function StatusBarDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="w-full max-w-3xl overflow-hidden rounded-mark border border-border">
      <StatusBar className="ink bg-background">
        <StatusBarItem asChild>
          <a href="#docs">
            <BookOpenIcon aria-hidden="true" />
            {copy.docs}
          </a>
        </StatusBarItem>
        <StatusBarItem>
          <span aria-hidden="true" className={statusDotVariants({ tone: "success" })} />
          {copy.connected}
        </StatusBarItem>
        <StatusBarSeparator />
        <StatusBarItem>{copy.queue}</StatusBarItem>
        <StatusBarItem>{copy.delivered}</StatusBarItem>
        <StatusBarSpacer />
        <StatusBarShortcut keys={["J", "K"]}>{copy.move}</StatusBarShortcut>
        <StatusBarShortcut keys={["↵"]}>{copy.open}</StatusBarShortcut>
        <StatusBarShortcut keys={["⌘", "K"]}>{copy.commands}</StatusBarShortcut>
      </StatusBar>
    </div>
  );
}
