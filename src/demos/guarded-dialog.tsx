"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GuardedDialog } from "@/components/ui/guarded-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOpenCount } from "@/components/ui/use-open-count";

export const defaultCopy = {
  trigger: "Rename mailbox",
  close: "Close",
  title: "Rename mailbox",
  description: "People who write to the old name get a bounce.",
  name: "Name",
  cancel: "Cancel",
  save: "Save",
};

export default function GuardedDialogDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  // Keys the form, so a second open starts from the saved name rather than the last draft.
  const openCount = useOpenCount(open);

  const save = () => {
    setPending(true);
    // Two seconds of pretend saving: the close button is gone, and Escape and clicks outside do nothing.
    setTimeout(() => {
      setPending(false);
      setOpen(false);
    }, 2000);
  };

  return (
    <>
      <Button ref={opener} variant="outline" onClick={() => setOpen(true)}>
        {copy.trigger}
      </Button>
      <GuardedDialog
        open={open}
        onOpenChange={setOpen}
        pending={pending}
        returnFocusTo={opener}
        closeLabel={copy.close}
      >
        <form
          key={openCount}
          className="contents"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <DialogHeader>
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="guarded-name">{copy.name}</Label>
            <Input id="guarded-name" defaultValue="hello" disabled={pending} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>
              {copy.cancel}
            </Button>
            <Button type="submit" loading={pending}>
              {copy.save}
            </Button>
          </DialogFooter>
        </form>
      </GuardedDialog>
    </>
  );
}
