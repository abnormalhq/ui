import { TextLink } from "@/components/ui/text-link";
import { fillTemplate, type Template } from "@/lib/template";

/* In a project the template comes from each language's copy; the slots it may use are in its type. */
export const defaultCopy = {
  notice: "Requests are covered by the {terms} and the {privacy}.",
  terms: "Terms",
  privacy: "Privacy Policy",
};

export default function TemplateDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <p className="text-sm">
      {fillTemplate(copy.notice as Template<"terms" | "privacy">, {
        terms: (
          <TextLink key="terms" href="#">
            {copy.terms}
          </TextLink>
        ),
        privacy: (
          <TextLink key="privacy" href="#">
            {copy.privacy}
          </TextLink>
        ),
      })}
    </p>
  );
}
