import { Bento, BentoDescription, BentoTile, BentoTitle, BentoVisual } from "@/components/ui/bento";

export const defaultCopy = {
  undoTitle: "Undo and schedule",
  undoDescription: "Take a message back for a few seconds after sending, or send it tomorrow morning.",
  sent: "Sent",
  undo: "Undo",
  searchTitle: "Fast search",
  searchDescription: "Every folder at once, with the matches highlighted.",
  codeTitle: "Two-step sign-in",
  codeDescription: "A code on top of the password.",
};

export default function BentoDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <Bento asChild className="w-full max-w-3xl">
      <ul>
        <BentoTile asChild wide>
          <li>
            <div>
              <BentoTitle>{copy.undoTitle}</BentoTitle>
              <BentoDescription>{copy.undoDescription}</BentoDescription>
            </div>
            <BentoVisual aria-hidden="true">
              <span className="inline-flex items-center gap-4 rounded-mark bg-foreground px-4 py-2.5 text-sm text-background">
                {copy.sent}
                <span className="font-semibold">{copy.undo}</span>
              </span>
            </BentoVisual>
          </li>
        </BentoTile>
        <BentoTile asChild>
          <li>
            <div>
              <BentoTitle>{copy.searchTitle}</BentoTitle>
              <BentoDescription>{copy.searchDescription}</BentoDescription>
            </div>
            <BentoVisual aria-hidden="true">
              <code className="block rounded-mark border border-input px-3 py-2 font-mono text-sm">
                from:<span className="text-signal">alice</span> has:attachment
              </code>
            </BentoVisual>
          </li>
        </BentoTile>
        <BentoTile asChild>
          <li>
            <div>
              <BentoTitle>{copy.codeTitle}</BentoTitle>
              <BentoDescription>{copy.codeDescription}</BentoDescription>
            </div>
            <BentoVisual aria-hidden="true">
              <span className="font-mono text-2xl tracking-[0.2em]">482 913</span>
            </BentoVisual>
          </li>
        </BentoTile>
      </ul>
    </Bento>
  );
}
