import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetField,
  SheetFields,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open details</Button>
      </SheetTrigger>
      <SheetContent closeLabel="Close">
        <SheetHeader>
          <SheetTitle>hello@example.com</SheetTitle>
          <SheetDescription>Created on 4 November</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <SheetFields>
            <SheetField label="Owner">Support</SheetField>
            <SheetField label="Quota">5 GB</SheetField>
          </SheetFields>
        </SheetBody>
        <SheetFooter>
          <Button>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
