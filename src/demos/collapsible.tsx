import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const defaultCopy = { mailServer: "Mail server", advanced: "Advanced", port: "Port" };

export default function CollapsibleDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <Collapsible className="grid w-full max-w-sm gap-3">
      <div className="grid gap-2">
        <Label htmlFor="collapsible-host">{copy.mailServer}</Label>
        <Input id="collapsible-host" defaultValue="mail.example.com" />
      </div>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="group w-fit">
          {copy.advanced}
          <ChevronDownIcon className="transition-transform duration-150 group-data-[state=open]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid gap-2 pb-1">
          <Label htmlFor="collapsible-port">{copy.port}</Label>
          <Input id="collapsible-port" defaultValue="993" inputMode="numeric" />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
