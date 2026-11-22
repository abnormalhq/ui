import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const defaultCopy = {
  trigger: "Rename mailbox",
  close: "Close",
  title: "Rename mailbox",
  description: "People who write to the old name get a bounce.",
  name: "Name",
  cancel: "Cancel",
  save: "Save",
};

export default function DialogDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{copy.trigger}</Button>
      </DialogTrigger>
      <DialogContent closeLabel={copy.close}>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="dialog-name">{copy.name}</Label>
          <Input id="dialog-name" defaultValue="hello" />
        </div>
        <DialogFooter showCloseButton closeLabel={copy.cancel}>
          <Button>{copy.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
