import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TabsDemo() {
  return (
    <div className="grid w-full max-w-lg gap-8">
      <Tabs defaultValue="general">
        <TabsList aria-label="Domain settings">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="dns">DNS records</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="billing" disabled>
            Billing
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="text-muted-foreground">
          The domain is verified and receiving mail.
        </TabsContent>
        <TabsContent value="dns" className="text-muted-foreground">
          Four records are published; none need attention.
        </TabsContent>
        <TabsContent value="members" className="text-muted-foreground">
          Twelve people have a mailbox on this domain.
        </TabsContent>
      </Tabs>
      <Tabs defaultValue="profile">
        <TabsList variant="pill" aria-label="Mailbox settings">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="vacation">Vacation reply</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="text-muted-foreground">
          The name and picture people see.
        </TabsContent>
        <TabsContent value="vacation" className="text-muted-foreground">
          No reply is scheduled.
        </TabsContent>
        <TabsContent value="storage" className="text-muted-foreground">
          2.1 GB of 10 GB used.
        </TabsContent>
      </Tabs>
    </div>
  );
}
