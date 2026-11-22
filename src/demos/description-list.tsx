import { CopyButton } from "@/components/ui/copy-button";
import {
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
} from "@/components/ui/description-list";
import { StatusLabel } from "@/components/ui/status-label";

export const defaultCopy = {
  status: "Status",
  connected: "Connected",
  mailHost: "Mail host",
  apiKey: "API key",
  copyApiKey: "Copy API key",
  copied: "Copied",
  copyFailed: "Copy failed",
  order: "Order",
  plan: "Plan",
  teamPlan: "Team, 5 mailboxes",
  total: "Total",
};

export default function DescriptionListDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-md gap-8">
      <DescriptionList variant="panel">
        <DescriptionItem label={copy.status}>
          <StatusLabel tone="success" variant="dot" className="text-sm text-foreground">
            {copy.connected}
          </StatusLabel>
        </DescriptionItem>
        <DescriptionItem label={copy.mailHost}>
          <span className="font-mono">mail.example.com</span>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>{copy.apiKey}</DescriptionTerm>
          <DescriptionDetails
            action={
              <CopyButton
                text="sk_live_8f3k2c9d"
                label={copy.copyApiKey}
                copiedLabel={copy.copied}
                failedLabel={copy.copyFailed}
              />
            }
          >
            <span className="font-mono">sk_live_8f3k2c9d</span>
          </DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>
      <DescriptionList variant="spread">
        <DescriptionItem label={copy.order}>A-20931</DescriptionItem>
        <DescriptionItem label={copy.plan}>{copy.teamPlan}</DescriptionItem>
        <DescriptionItem label={copy.total}>$45.00</DescriptionItem>
      </DescriptionList>
    </div>
  );
}
