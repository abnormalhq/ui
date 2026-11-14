import { Field, FieldControl, FieldHint, FieldLabel, SwitchField } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";

export default function FieldDemo() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <Field>
        <FieldLabel>Display name</FieldLabel>
        <FieldControl>
          <Input name="name" defaultValue="Support" />
        </FieldControl>
        <FieldHint>Shown to the people you write to.</FieldHint>
      </Field>
      <Field error="This address is already taken.">
        <FieldLabel>Address</FieldLabel>
        <FieldControl>
          <Input name="address" defaultValue="hello@example.com" />
        </FieldControl>
        <FieldHint>Letters, numbers and dots.</FieldHint>
      </Field>
      <div className="grid gap-2">
        <SwitchField
          name="store"
          defaultChecked
          label="Keep the public key on the server"
          description="So other people's mail apps can find it."
        />
        <Field orientation="row">
          <FieldLabel>Language</FieldLabel>
          <FieldHint>For the interface and the mail it sends.</FieldHint>
          <FieldControl>
            <NativeSelect name="language" defaultValue="en" className="w-32">
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </NativeSelect>
          </FieldControl>
        </Field>
      </div>
    </div>
  );
}
