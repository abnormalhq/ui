import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ButtonDemo() {
  return (
    <div className="grid justify-items-center gap-5">
      <div className="flex flex-wrap justify-center gap-2">
        <Button>Save</Button>
        <Button variant="outline">Cancel</Button>
        <Button variant="secondary">Duplicate</Button>
        <Button variant="ghost">Skip</Button>
        <Button variant="destructive">Delete</Button>
        <Button variant="link">Learn more</Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button size="xs">Extra small</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">
          Continue
          <ArrowRightIcon />
        </Button>
        <Button size="icon" variant="outline" aria-label="Add">
          <PlusIcon />
        </Button>
        <Button disabled>Disabled</Button>
        <Button loading>Saving</Button>
        <Button size="icon" variant="outline" loading aria-label="Adding">
          <PlusIcon />
        </Button>
      </div>
    </div>
  );
}
