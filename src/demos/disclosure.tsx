import { Disclosure, DisclosureContent, DisclosureList, DisclosureTrigger } from "@/components/ui/disclosure";

const questions = [
  { question: "Can I change plans later?", answer: "Yes. A change applies from the next billing period." },
  { question: "Where is my mail stored?", answer: "On the mail server of the region you picked at sign-up." },
];

export default function DisclosureDemo() {
  return (
    <DisclosureList className="w-full max-w-lg">
      {questions.map(({ question, answer }) => (
        <Disclosure key={question}>
          <DisclosureTrigger>
            <span className="min-w-0 flex-1 text-lg font-medium">{question}</span>
          </DisclosureTrigger>
          <DisclosureContent>{answer}</DisclosureContent>
        </Disclosure>
      ))}
    </DisclosureList>
  );
}
