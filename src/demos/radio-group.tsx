import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const plans = [
  { value: "monthly", label: "Monthly", note: "Cancel any time" },
  { value: "yearly", label: "Yearly", note: "Two months free" },
] as const;

export default function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="monthly" aria-label="Billing period">
      {plans.map(({ value, label, note }) => (
        <div key={value} className="flex items-start gap-3">
          <RadioGroupItem value={value} id={`radio-${value}`} className="mt-0.5" />
          <Label htmlFor={`radio-${value}`} className="grid gap-1 leading-snug">
            {label}
            <span className="font-normal text-muted-foreground">{note}</span>
          </Label>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <RadioGroupItem value="lifetime" id="radio-lifetime" disabled />
        <Label htmlFor="radio-lifetime">Lifetime</Label>
      </div>
    </RadioGroup>
  );
}
