import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const defaultCopy = {
  email: "Email",
  invalid: "Invalid",
  disabled: "Disabled",
  small: "Small",
  default: "Default",
  large: "Large",
  smallPlaceholder: "sm, 28px",
  defaultPlaceholder: "default, 32px",
  largePlaceholder: "lg, 40px",
};

export default function InputDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-sm gap-4">
      <div className="grid gap-2">
        <Label htmlFor="input-email">{copy.email}</Label>
        <Input id="input-email" type="email" placeholder="you@example.com" />
      </div>
      <Input aria-label={copy.invalid} aria-invalid defaultValue="not an address" />
      <Input aria-label={copy.disabled} disabled defaultValue="Disabled" />
      <div className="flex items-center gap-2">
        <Input size="sm" aria-label={copy.small} placeholder={copy.smallPlaceholder} />
        <Input aria-label={copy.default} placeholder={copy.defaultPlaceholder} />
        <Input size="lg" aria-label={copy.large} placeholder={copy.largePlaceholder} />
      </div>
    </div>
  );
}
