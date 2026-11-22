import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoHint } from "@/components/ui/info-hint";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderBack,
  PageHeaderDescription,
  PageHeaderHeading,
  PageHeaderRow,
  PageHeaderTitle,
} from "@/components/ui/page-header";

export const defaultCopy = {
  mailboxes: "Mailboxes",
  aboutMailboxes: "About mailboxes",
  mailboxDescription: "Every address that receives mail on your domains.",
  export: "Export",
  newMailbox: "New mailbox",
  resetPassword: "Reset password",
  createdUsage: "Created on 4 November, 2.1 GB of 10 GB used.",
};

export default function PageHeaderDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full gap-8">
      <PageHeader>
        <PageHeaderRow>
          <PageHeaderHeading>
            <PageHeaderTitle asChild>
              <h2>{copy.mailboxes}</h2>
            </PageHeaderTitle>
            <InfoHint label={copy.aboutMailboxes}>{copy.mailboxDescription}</InfoHint>
          </PageHeaderHeading>
          <PageHeaderActions>
            <Button variant="outline">{copy.export}</Button>
            <Button>
              <PlusIcon />
              {copy.newMailbox}
            </Button>
          </PageHeaderActions>
        </PageHeaderRow>
      </PageHeader>
      <PageHeader>
        <PageHeaderBack href="#">{copy.mailboxes}</PageHeaderBack>
        <PageHeaderRow>
          <PageHeaderTitle asChild>
            <h2>hello@example.com</h2>
          </PageHeaderTitle>
          <PageHeaderActions>
            <Button variant="outline">{copy.resetPassword}</Button>
          </PageHeaderActions>
        </PageHeaderRow>
        <PageHeaderDescription>{copy.createdUsage}</PageHeaderDescription>
      </PageHeader>
    </div>
  );
}
