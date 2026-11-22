import { FieldMessage } from "@/components/ui/field-message";

export const defaultCopy = {
  lettersAndNumbers: "Letters and numbers only.",
  checkingAddress: "Checking this address.",
  addressFree: "This address is free.",
  addressTaken: "This address is already taken.",
};

export default function FieldMessageDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-sm">
      <FieldMessage>{copy.lettersAndNumbers}</FieldMessage>
      <FieldMessage tone="busy">{copy.checkingAddress}</FieldMessage>
      <FieldMessage tone="ok">{copy.addressFree}</FieldMessage>
      <FieldMessage tone="error">{copy.addressTaken}</FieldMessage>
    </div>
  );
}
