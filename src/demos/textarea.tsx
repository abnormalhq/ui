import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const defaultCopy = { message: "Message", writeMessage: "Write a message" };

export default function TextareaDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="textarea-message">{copy.message}</Label>
      <Textarea id="textarea-message" placeholder={copy.writeMessage} />
    </div>
  );
}
