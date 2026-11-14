import { Stat, StatDelta, StatGrid, StatHint } from "@/components/ui/stat";

export default function StatDemo() {
  return (
    <div className="grid w-full gap-8">
      <StatGrid columns={4}>
        <Stat label="Sent" value="12,480">
          <StatDelta direction="up" tone="success">
            +12% on last week
          </StatDelta>
        </Stat>
        <Stat label="Bounced" value="0.4%">
          <StatDelta direction="down" tone="success">
            −0.1 points
          </StatDelta>
        </Stat>
        <Stat label="Complaints" value="3">
          <StatDelta direction="up" tone="destructive">
            +2 on last week
          </StatDelta>
        </Stat>
        <Stat label="Storage" value="—" muted>
          <StatHint>Not fetched yet</StatHint>
        </Stat>
      </StatGrid>
      <StatGrid variant="joined" columns={3}>
        <Stat label="Mailboxes" value="248">
          <StatHint>12 added in the last 30 days</StatHint>
        </Stat>
        <Stat label="Domains" value="6">
          <StatHint>All verified</StatHint>
        </Stat>
        <Stat label="Aliases" value="1,032">
          <StatHint>Across every domain</StatHint>
        </Stat>
      </StatGrid>
    </div>
  );
}
