import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CollapsibleDemo() {
  return (
    <Collapsible className="grid w-full max-w-sm gap-3">
      <div className="grid gap-2">
        <Label htmlFor="collapsible-host">Mail server</Label>
        <Input id="collapsible-host" defaultValue="mail.example.com" />
      </div>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="group w-fit">
          Advanced
          <ChevronDownIcon className="transition-transform duration-150 group-data-[state=open]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid gap-2 pb-1">
          <Label htmlFor="collapsible-port">Port</Label>
          <Input id="collapsible-port" defaultValue="993" inputMode="numeric" />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
