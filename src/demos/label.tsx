import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const defaultCopy = { fullName: "Full name" };

export default function LabelDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="label-name">{copy.fullName}</Label>
      <Input id="label-name" />
    </div>
  );
}
