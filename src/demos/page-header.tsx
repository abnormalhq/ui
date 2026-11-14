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

export default function PageHeaderDemo() {
  return (
    <div className="grid w-full gap-8">
      <PageHeader>
        <PageHeaderRow>
          <PageHeaderHeading>
            <PageHeaderTitle asChild>
              <h2>Mailboxes</h2>
            </PageHeaderTitle>
            <InfoHint label="About mailboxes">Every address that receives mail on your domains.</InfoHint>
          </PageHeaderHeading>
          <PageHeaderActions>
            <Button variant="outline">Export</Button>
            <Button>
              <PlusIcon />
              New mailbox
            </Button>
          </PageHeaderActions>
        </PageHeaderRow>
      </PageHeader>
      <PageHeader>
        <PageHeaderBack href="#">Mailboxes</PageHeaderBack>
        <PageHeaderRow>
          <PageHeaderTitle asChild>
            <h2>hello@example.com</h2>
          </PageHeaderTitle>
          <PageHeaderActions>
            <Button variant="outline">Reset password</Button>
          </PageHeaderActions>
        </PageHeaderRow>
        <PageHeaderDescription>Created on 4 November, 2.1 GB of 10 GB used.</PageHeaderDescription>
      </PageHeader>
    </div>
  );
}
