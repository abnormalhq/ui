import { BrandMark } from "@/components/ui/brand-mark";
import { Workspace, WorkspaceNavigation, WorkspacePane } from "@/components/ui/workspace";

export default function Demo() {
  return (
    <Workspace className="w-full">
      <WorkspaceNavigation className="md:w-40">
        <div className="flex items-center gap-2 font-medium">
          <BrandMark className="size-6" /> Workspace
        </div>
        <p className="rounded-control bg-highlight px-3 py-2 font-medium text-highlight-foreground">Current view</p>
        <p className="text-xs text-muted-foreground">Ink navigation in both themes</p>
      </WorkspaceNavigation>
      <WorkspacePane padding="compact" className="gap-2 md:w-40 md:flex-none">
        <h3 className="font-semibold">Compact list</h3>
        <p className="text-sm text-muted-foreground">Dense information; the text stays readable.</p>
      </WorkspacePane>
      <WorkspacePane asChild>
        <section aria-label="Reading pane" className="gap-3">
          <h3 className="text-xl font-semibold">Room to read</h3>
          <p className="max-w-prose text-sm text-muted-foreground">
            This paper pane follows the page theme. It is beside the ink navigation, never nested inside it.
          </p>
          <p className="text-xs text-muted-foreground">Pane padding is local. The page owns widths and scrolling.</p>
        </section>
      </WorkspacePane>
    </Workspace>
  );
}
