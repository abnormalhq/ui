import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TextareaDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="textarea-message">Message</Label>
      <Textarea id="textarea-message" placeholder="Write a message" />
    </div>
  );
}
