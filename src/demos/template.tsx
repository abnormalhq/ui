import { TextLink } from "@/components/ui/text-link";
import { fillTemplate, type Template } from "@/lib/template";

/* In a project the template comes from each language's copy; the slots it may use are in its type. */
const notice: Template<"terms" | "privacy"> = "Requests are covered by the {terms} and the {privacy}.";

export default function TemplateDemo() {
  return (
    <p className="text-sm">
      {fillTemplate(notice, {
        terms: (
          <TextLink key="terms" href="#">
            Terms
          </TextLink>
        ),
        privacy: (
          <TextLink key="privacy" href="#">
            Privacy Policy
          </TextLink>
        ),
      })}
    </p>
  );
}
