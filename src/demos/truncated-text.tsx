import { TruncatedText } from "@/components/ui/truncated-text";

export const defaultCopy = {
  quarterlyReport: "Re: The quarterly report, with the numbers from every region and the notes from the meeting",
  shortSubject: "Short subject",
  longerNote:
    "A longer note that is allowed two lines before it is cut, and shows the rest in the tooltip when it was.",
};

export default function TruncatedTextDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-64 gap-3 text-sm">
      <TruncatedText text={copy.quarterlyReport} />
      <TruncatedText text={copy.shortSubject} />
      <TruncatedText className="line-clamp-2 whitespace-normal" text={copy.longerNote} />
    </div>
  );
}
