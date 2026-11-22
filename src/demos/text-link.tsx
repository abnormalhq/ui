import { ArrowRightIcon } from "lucide-react";
import { TextLink } from "@/components/ui/text-link";

export const defaultCopy = {
  readGuide: "Read the guide",
  remembered: "Remembered it?",
  signIn: "Back to sign in",
};

export default function TextLinkDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid justify-items-center gap-4">
      <TextLink href="#">
        {copy.readGuide}
        <ArrowRightIcon className="size-4" />
      </TextLink>
      <p className="text-sm text-muted-foreground">
        {copy.remembered}{" "}
        <TextLink variant="inline" href="#">
          {copy.signIn}
        </TextLink>
      </p>
    </div>
  );
}
