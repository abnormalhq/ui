import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const defaultCopy = {
  billingPeriod: "Billing period",
  monthly: "Monthly",
  cancelAnyTime: "Cancel any time",
  yearly: "Yearly",
  twoMonthsFree: "Two months free",
  lifetime: "Lifetime",
};

const plans = [
  { value: "monthly", label: "monthly", note: "cancelAnyTime" },
  { value: "yearly", label: "yearly", note: "twoMonthsFree" },
] as const;

export default function RadioGroupDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <RadioGroup defaultValue="monthly" aria-label={copy.billingPeriod}>
      {plans.map(({ value, label, note }) => (
        <div key={value} className="flex items-start gap-3">
          <RadioGroupItem value={value} id={`radio-${value}`} className="mt-0.5" />
          <Label htmlFor={`radio-${value}`} className="grid gap-1 leading-snug">
            {copy[label]}
            <span className="font-normal text-muted-foreground">{copy[note]}</span>
          </Label>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <RadioGroupItem value="lifetime" id="radio-lifetime" disabled />
        <Label htmlFor="radio-lifetime">{copy.lifetime}</Label>
      </div>
    </RadioGroup>
  );
}
