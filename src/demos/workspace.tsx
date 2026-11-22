import { BrandMark } from "@/components/ui/brand-mark";
import { Workspace, WorkspaceNavigation, WorkspacePane } from "@/components/ui/workspace";

export const defaultCopy = {
  workspace: "Workspace",
  currentView: "Current view",
  inkNavigation: "Ink navigation in both themes",
  compactList: "Compact list",
  denseInfo: "Dense information; the text stays readable.",
  readingPane: "Reading pane",
  roomToRead: "Room to read",
  paperPane: "This paper pane follows the page theme. It is beside the ink navigation, never nested inside it.",
  padding: "Pane padding is local. The page owns widths and scrolling.",
};

export default function Demo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <Workspace className="w-full">
      <WorkspaceNavigation className="md:w-40">
        <div className="flex items-center gap-2 font-medium">
          <BrandMark className="size-6" /> {copy.workspace}
        </div>
        <p className="rounded-control bg-highlight px-3 py-2 font-medium text-highlight-foreground">
          {copy.currentView}
        </p>
        <p className="text-xs text-muted-foreground">{copy.inkNavigation}</p>
      </WorkspaceNavigation>
      <WorkspacePane padding="compact" className="gap-2 md:w-40 md:flex-none">
        <h3 className="font-semibold">{copy.compactList}</h3>
        <p className="text-sm text-muted-foreground">{copy.denseInfo}</p>
      </WorkspacePane>
      <WorkspacePane asChild>
        <section aria-label={copy.readingPane} className="gap-3">
          <h3 className="text-xl font-semibold">{copy.roomToRead}</h3>
          <p className="max-w-prose text-sm text-muted-foreground">{copy.paperPane}</p>
          <p className="text-xs text-muted-foreground">{copy.padding}</p>
        </section>
      </WorkspacePane>
    </Workspace>
  );
}
