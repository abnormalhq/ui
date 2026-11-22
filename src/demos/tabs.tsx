import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const defaultCopy = {
  domainSettings: "Domain settings",
  general: "General",
  dnsRecords: "DNS records",
  members: "Members",
  billing: "Billing",
  domainVerified: "The domain is verified and receiving mail.",
  recordsPublished: "Four records are published; none need attention.",
  peopleHaveMailboxes: "Twelve people have a mailbox on this domain.",
  mailboxSettings: "Mailbox settings",
  profile: "Profile",
  vacationReply: "Vacation reply",
  storage: "Storage",
  namePicture: "The name and picture people see.",
  noReply: "No reply is scheduled.",
  storageUsed: "2.1 GB of 10 GB used.",
};

export default function TabsDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-lg gap-8">
      <Tabs defaultValue="general">
        <TabsList aria-label={copy.domainSettings}>
          <TabsTrigger value="general">{copy.general}</TabsTrigger>
          <TabsTrigger value="dns">{copy.dnsRecords}</TabsTrigger>
          <TabsTrigger value="members">{copy.members}</TabsTrigger>
          <TabsTrigger value="billing" disabled>
            {copy.billing}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="text-muted-foreground">
          {copy.domainVerified}
        </TabsContent>
        <TabsContent value="dns" className="text-muted-foreground">
          {copy.recordsPublished}
        </TabsContent>
        <TabsContent value="members" className="text-muted-foreground">
          {copy.peopleHaveMailboxes}
        </TabsContent>
      </Tabs>
      <Tabs defaultValue="profile">
        <TabsList variant="pill" aria-label={copy.mailboxSettings}>
          <TabsTrigger value="profile">{copy.profile}</TabsTrigger>
          <TabsTrigger value="vacation">{copy.vacationReply}</TabsTrigger>
          <TabsTrigger value="storage">{copy.storage}</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="text-muted-foreground">
          {copy.namePicture}
        </TabsContent>
        <TabsContent value="vacation" className="text-muted-foreground">
          {copy.noReply}
        </TabsContent>
        <TabsContent value="storage" className="text-muted-foreground">
          {copy.storageUsed}
        </TabsContent>
      </Tabs>
    </div>
  );
}
