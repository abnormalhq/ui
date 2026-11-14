import { ArrowRightIcon } from "lucide-react";
import { TextLink } from "@/components/ui/text-link";

export default function TextLinkDemo() {
  return (
    <div className="grid justify-items-center gap-4">
      <TextLink href="#">
        Read the guide
        <ArrowRightIcon className="size-4" />
      </TextLink>
      <p className="text-sm text-muted-foreground">
        Remembered it?{" "}
        <TextLink variant="inline" href="#">
          Back to sign in
        </TextLink>
      </p>
    </div>
  );
}
