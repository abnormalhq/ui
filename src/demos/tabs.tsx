import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TabsDemo() {
  return (
    <Tabs defaultValue="general" className="w-full max-w-lg">
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
  );
}
