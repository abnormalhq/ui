import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function CheckboxDemo() {
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2.5">
        <Checkbox id="checkbox-default" />
        <Label htmlFor="checkbox-default">Unchecked</Label>
      </div>
      <div className="flex items-center gap-2.5">
        <Checkbox id="checkbox-checked" defaultChecked />
        <Label htmlFor="checkbox-checked">Checked</Label>
      </div>
      <div className="flex items-center gap-2.5">
        <Checkbox id="checkbox-mixed" defaultChecked="indeterminate" />
        <Label htmlFor="checkbox-mixed">Indeterminate</Label>
      </div>
      <div className="flex items-center gap-2.5">
        <Checkbox id="checkbox-disabled" disabled />
        <Label htmlFor="checkbox-disabled">Disabled</Label>
      </div>
    </div>
  );
}
