import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const defaultCopy = {
  save: "Save",
  buy: "Buy a mailbox",
  cancel: "Cancel",
  duplicate: "Duplicate",
  skip: "Skip",
  delete: "Delete",
  learnMore: "Learn more",
  extraSmall: "Extra small",
  small: "Small",
  continue: "Continue",
  add: "Add",
  disabled: "Disabled",
  saving: "Saving",
  adding: "Adding",
};

export default function ButtonDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid justify-items-center gap-5">
      <div className="flex flex-wrap justify-center gap-2">
        <Button>{copy.save}</Button>
        <Button variant="highlight">{copy.buy}</Button>
        <Button variant="outline">{copy.cancel}</Button>
        <Button variant="secondary">{copy.duplicate}</Button>
        <Button variant="ghost">{copy.skip}</Button>
        <Button variant="destructive">{copy.delete}</Button>
        <Button variant="link">{copy.learnMore}</Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button size="xs">{copy.extraSmall}</Button>
        <Button size="sm">{copy.small}</Button>
        <Button size="lg">
          {copy.continue}
          <ArrowRightIcon />
        </Button>
        <Button size="icon" variant="outline" aria-label={copy.add}>
          <PlusIcon />
        </Button>
        <Button disabled>{copy.disabled}</Button>
        <Button loading>{copy.saving}</Button>
        <Button size="icon" variant="outline" loading aria-label={copy.adding}>
          <PlusIcon />
        </Button>
      </div>
    </div>
  );
}
