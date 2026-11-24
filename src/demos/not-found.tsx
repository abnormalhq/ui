import { Button } from "@/components/ui/button";
import {
  NotFound,
  NotFoundActions,
  NotFoundAside,
  NotFoundCode,
  NotFoundDescription,
  NotFoundTitle,
} from "@/components/ui/not-found";

export const defaultCopy = {
  code: "404 · Page not found",
  title: "This page doesn't exist",
  description: "The link may be old, or the address mistyped. Start again from the home page.",
  home: "Back to home",
  help: "Help center",
  pricing: "Plans and prices",
};

export default function NotFoundDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    // The gallery page already has its main, so the demo sets the page on a section, framed to the size of a window.
    <NotFound asChild className="min-h-0 rounded-panel border border-border py-12">
      <section aria-label={copy.code}>
        <NotFoundCode>{copy.code}</NotFoundCode>
        <NotFoundTitle asChild>
          <h2>{copy.title}</h2>
        </NotFoundTitle>
        <NotFoundDescription>{copy.description}</NotFoundDescription>
        <NotFoundActions>
          <Button>{copy.home}</Button>
        </NotFoundActions>
        <NotFoundAside>
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            <li>
              <a href="#" className="underline decoration-current/40 underline-offset-4 hover:text-foreground">
                {copy.help}
              </a>
            </li>
            <li>
              <a href="#" className="underline decoration-current/40 underline-offset-4 hover:text-foreground">
                {copy.pricing}
              </a>
            </li>
          </ul>
        </NotFoundAside>
      </section>
    </NotFound>
  );
}
