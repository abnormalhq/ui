import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetField,
  SheetFields,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const defaultCopy = {
  openDetails: "Open details",
  close: "Close",
  createdOn: "Created on 4 November",
  owner: "Owner",
  support: "Support",
  quota: "Quota",
  cancel: "Cancel",
  save: "Save",
};

export default function SheetDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">{copy.openDetails}</Button>
      </SheetTrigger>
      <SheetContent closeLabel={copy.close}>
        <SheetHeader>
          <SheetTitle>hello@example.com</SheetTitle>
          <SheetDescription>{copy.createdOn}</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <SheetFields>
            <SheetField label={copy.owner}>{copy.support}</SheetField>
            <SheetField label={copy.quota}>5 GB</SheetField>
          </SheetFields>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">{copy.cancel}</Button>
          </SheetClose>
          <Button>{copy.save}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
