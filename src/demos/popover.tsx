import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const defaultCopy = {
  filter: "Filter",
  sender: "Sender",
};

export default function PopoverDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{copy.filter}</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid gap-2">
          <Label htmlFor="popover-sender">{copy.sender}</Label>
          <Input id="popover-sender" placeholder="you@example.com" />
        </div>
      </PopoverContent>
    </Popover>
  );
}
