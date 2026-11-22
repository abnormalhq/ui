import { Disclosure, DisclosureContent, DisclosureList, DisclosureTrigger } from "@/components/ui/disclosure";

export const defaultCopy = {
  changePlans: "Can I change plans later?",
  changePlansAnswer: "Yes. A change applies from the next billing period.",
  mailStorage: "Where is my mail stored?",
  mailStorageAnswer: "On the mail server of the region you picked at sign-up.",
};

const questions = [
  { id: "change-plans", question: "changePlans", answer: "changePlansAnswer" },
  { id: "mail-storage", question: "mailStorage", answer: "mailStorageAnswer" },
] as const;

export default function DisclosureDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <DisclosureList className="w-full max-w-lg">
      {questions.map(({ id, question, answer }) => (
        <Disclosure key={id}>
          <DisclosureTrigger>
            <span className="min-w-0 flex-1 text-lg font-medium">{copy[question]}</span>
          </DisclosureTrigger>
          <DisclosureContent>{copy[answer]}</DisclosureContent>
        </Disclosure>
      ))}
    </DisclosureList>
  );
}
