import { Stat, StatDelta, StatGrid, StatHint } from "@/components/ui/stat";

export const defaultCopy = {
  sent: "Sent",
  sentDelta: "+12% on last week",
  bounced: "Bounced",
  bouncedDelta: "−0.1 points",
  complaints: "Complaints",
  complaintDelta: "+2 on last week",
  storage: "Storage",
  notFetched: "Not fetched yet",
  mailboxes: "Mailboxes",
  mailboxesAdded: "12 added in the last 30 days",
  domains: "Domains",
  verified: "All verified",
  aliases: "Aliases",
  acrossDomains: "Across every domain",
};

export default function StatDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full gap-8">
      <StatGrid columns={4}>
        <Stat label={copy.sent} value="12,480">
          <StatDelta direction="up" tone="success">
            {copy.sentDelta}
          </StatDelta>
        </Stat>
        <Stat label={copy.bounced} value="0.4%">
          <StatDelta direction="down" tone="success">
            {copy.bouncedDelta}
          </StatDelta>
        </Stat>
        <Stat label={copy.complaints} value="3">
          <StatDelta direction="up" tone="destructive">
            {copy.complaintDelta}
          </StatDelta>
        </Stat>
        <Stat label={copy.storage} value="—" muted>
          <StatHint>{copy.notFetched}</StatHint>
        </Stat>
      </StatGrid>
      <StatGrid variant="joined" columns={3}>
        <Stat label={copy.mailboxes} value="248">
          <StatHint>{copy.mailboxesAdded}</StatHint>
        </Stat>
        <Stat label={copy.domains} value="6">
          <StatHint>{copy.verified}</StatHint>
        </Stat>
        <Stat label={copy.aliases} value="1,032">
          <StatHint>{copy.acrossDomains}</StatHint>
        </Stat>
      </StatGrid>
    </div>
  );
}
