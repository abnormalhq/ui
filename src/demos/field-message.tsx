import { FieldMessage } from "@/components/ui/field-message";

export default function FieldMessageDemo() {
  return (
    <div className="grid w-full max-w-sm">
      <FieldMessage>Letters and numbers only.</FieldMessage>
      <FieldMessage tone="busy">Checking this address.</FieldMessage>
      <FieldMessage tone="ok">This address is free.</FieldMessage>
      <FieldMessage tone="error">This address is already taken.</FieldMessage>
    </div>
  );
}
