import { ArrowRightIcon } from "lucide-react";
import { TextLink } from "@/components/ui/text-link";

export default function TextLinkDemo() {
  return (
    <TextLink href="#">
      Read the guide
      <ArrowRightIcon className="size-4" />
    </TextLink>
  );
}
