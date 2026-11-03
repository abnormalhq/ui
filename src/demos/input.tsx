import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function InputDemo() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <div className="grid gap-2">
        <Label htmlFor="input-email">Email</Label>
        <Input id="input-email" type="email" placeholder="you@example.com" />
      </div>
      <Input aria-label="Invalid" aria-invalid defaultValue="not an address" />
      <Input aria-label="Disabled" disabled defaultValue="Disabled" />
    </div>
  );
}
