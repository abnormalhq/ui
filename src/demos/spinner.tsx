import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export const defaultCopy = { saving: "Saving" };

export default function SpinnerDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="flex items-center gap-4">
      <Spinner />
      <Button disabled>
        <Spinner />
        {copy.saving}
      </Button>
    </div>
  );
}
