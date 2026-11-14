import { TruncatedText } from "@/components/ui/truncated-text";

export default function TruncatedTextDemo() {
  return (
    <div className="grid w-64 gap-3 text-sm">
      <TruncatedText text="Re: The quarterly report, with the numbers from every region and the notes from the meeting" />
      <TruncatedText text="Short subject" />
      <TruncatedText
        className="line-clamp-2 whitespace-normal"
        text="A longer note that is allowed two lines before it is cut, and shows the rest in the tooltip when it was."
      />
    </div>
  );
}
