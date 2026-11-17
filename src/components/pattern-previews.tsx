import { Banner, BannerDot, BannerText } from "@/components/ui/banner";
import { BrandMark } from "@/components/ui/brand-mark";
import { StatusLabel } from "@/components/ui/status-label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UptimeBar } from "@/components/ui/uptime-bar";
import { Workspace, WorkspaceNavigation, WorkspacePane } from "@/components/ui/workspace";

export function DataPreview() {
  return (
    <Workspace>
      <WorkspaceNavigation className="md:w-32">
        <div className="flex items-center gap-2 font-semibold">
          <BrandMark className="size-6" /> Doppel
        </div>
        <p className="rounded-control bg-highlight px-2 py-1.5 font-medium text-highlight-foreground">Profiles</p>
        <p className="mt-auto text-xs text-muted-foreground">Sample workspace</p>
      </WorkspaceNavigation>
      <WorkspacePane padding="compact" className="gap-4">
        <header>
          <h3 className="font-heading text-2xl font-semibold">Browser profiles</h3>
          <p className="mt-1 text-sm text-muted-foreground">Scan names, state and context on one continuous surface.</p>
        </header>
        <Table variant="plain" aria-label="Example browser profiles">
          <TableHeader>
            <TableRow>
              <TableHead>Profile</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Group</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Research</TableCell>
              <TableCell>
                <StatusLabel tone="success" variant="dot">
                  Running
                </StatusLabel>
              </TableCell>
              <TableCell>Work</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Reading</TableCell>
              <TableCell>
                <StatusLabel tone="pending" variant="dot">
                  Starting
                </StatusLabel>
              </TableCell>
              <TableCell>Personal</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Archive</TableCell>
              <TableCell>
                <StatusLabel tone="muted" variant="dot">
                  Stopped
                </StatusLabel>
              </TableCell>
              <TableCell>Work</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </WorkspacePane>
    </Workspace>
  );
}

/** A status page needs no workspace shell, table client code or decorative brand yellow. */
export function StatusPreview() {
  return (
    <div className="grid gap-5 rounded-panel border border-border p-4 md:p-6">
      <header className="flex items-center gap-2">
        <BrandMark className="size-6" />
        <h3 className="font-heading text-xl font-semibold">Service status</h3>
      </header>
      <Banner variant="panel" tone="success">
        <BannerText>
          <BannerDot />
          All systems operational
        </BannerText>
      </Banner>
      <div className="divide-y divide-border">
        {["Mail", "Doppel", "Website"].map((service) => (
          <div key={service} className="grid gap-2 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{service}</span>
              <StatusLabel variant="dot" tone="success">
                Operational
              </StatusLabel>
            </div>
            <UptimeBar
              label={`${service}: 30 example days, all operational`}
              buckets={Array.from({ length: 30 }, (_, day) => ({
                status: "up",
                title: `Example day ${day + 1}: operational`,
              }))}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Illustrative history, not live service health.</p>
    </div>
  );
}
