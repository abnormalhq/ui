import { CopyButton } from "@/components/ui/copy-button";
import {
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
} from "@/components/ui/description-list";
import { StatusLabel } from "@/components/ui/status-label";

export default function DescriptionListDemo() {
  return (
    <div className="grid w-full max-w-md gap-8">
      <DescriptionList variant="panel">
        <DescriptionItem label="Status">
          <StatusLabel tone="success" variant="dot" className="text-sm text-foreground">
            Connected
          </StatusLabel>
        </DescriptionItem>
        <DescriptionItem label="Mail host">
          <span className="font-mono">mail.example.com</span>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>API key</DescriptionTerm>
          <DescriptionDetails
            action={
              <CopyButton text="sk_live_8f3k2c9d" label="Copy API key" copiedLabel="Copied" failedLabel="Copy failed" />
            }
          >
            <span className="font-mono">sk_live_8f3k2c9d</span>
          </DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>
      <DescriptionList variant="spread">
        <DescriptionItem label="Order">A-20931</DescriptionItem>
        <DescriptionItem label="Plan">Team, 5 mailboxes</DescriptionItem>
        <DescriptionItem label="Total">$45.00</DescriptionItem>
      </DescriptionList>
    </div>
  );
}
