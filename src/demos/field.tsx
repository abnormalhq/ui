import { Field, FieldControl, FieldHint, FieldLabel, SwitchField } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";

export const defaultCopy = {
  displayName: "Display name",
  displayNameHint: "Shown to the people you write to.",
  address: "Address",
  addressError: "This address is already taken.",
  addressHint: "Letters, numbers and dots.",
  publicKey: "Keep the public key on the server",
  publicKeyDescription: "So other people's mail apps can find it.",
  language: "Language",
  languageHint: "For the interface and the mail it sends.",
  english: "English",
  german: "Deutsch",
};

export default function FieldDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-sm gap-6">
      <Field>
        <FieldLabel>{copy.displayName}</FieldLabel>
        <FieldControl>
          <Input name="name" defaultValue="Support" />
        </FieldControl>
        <FieldHint>{copy.displayNameHint}</FieldHint>
      </Field>
      <Field error={copy.addressError}>
        <FieldLabel>{copy.address}</FieldLabel>
        <FieldControl>
          <Input name="address" defaultValue="hello@example.com" />
        </FieldControl>
        <FieldHint>{copy.addressHint}</FieldHint>
      </Field>
      <div className="grid gap-2">
        <SwitchField name="store" defaultChecked label={copy.publicKey} description={copy.publicKeyDescription} />
        <Field orientation="row">
          <FieldLabel>{copy.language}</FieldLabel>
          <FieldHint>{copy.languageHint}</FieldHint>
          <FieldControl>
            <NativeSelect name="language" defaultValue="en" className="w-32">
              <option value="en">{copy.english}</option>
              <option value="de">{copy.german}</option>
            </NativeSelect>
          </FieldControl>
        </Field>
      </div>
    </div>
  );
}
