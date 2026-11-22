import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const defaultCopy = {
  unchecked: "Unchecked",
  checked: "Checked",
  indeterminate: "Indeterminate",
  disabled: "Disabled",
};

export default function CheckboxDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2.5">
        <Checkbox id="checkbox-default" />
        <Label htmlFor="checkbox-default">{copy.unchecked}</Label>
      </div>
      <div className="flex items-center gap-2.5">
        <Checkbox id="checkbox-checked" defaultChecked />
        <Label htmlFor="checkbox-checked">{copy.checked}</Label>
      </div>
      <div className="flex items-center gap-2.5">
        <Checkbox id="checkbox-mixed" defaultChecked="indeterminate" />
        <Label htmlFor="checkbox-mixed">{copy.indeterminate}</Label>
      </div>
      <div className="flex items-center gap-2.5">
        <Checkbox id="checkbox-disabled" disabled />
        <Label htmlFor="checkbox-disabled">{copy.disabled}</Label>
      </div>
    </div>
  );
}
