import { Kbd, KbdCombo } from "@/components/ui/kbd";

export const defaultCopy = {
  search: "Search",
  commandPalette: "Command palette",
  archive: "Archive",
  inbox: "Go to inbox",
  navigate: "Navigate",
  open: "Open",
  close: "Close",
};

const shortcuts = [
  { label: "search", keys: ["/"] },
  { label: "commandPalette", keys: ["⌘", "K"] },
  { label: "archive", keys: ["E"] },
  { label: "inbox", keys: ["G", "I"] },
] as const;

export default function KbdDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-sm gap-6">
      <p className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          {copy.navigate}
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>↵</Kbd>
          {copy.open}
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>Esc</Kbd>
          {copy.close}
        </span>
      </p>
      <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 text-sm">
        {shortcuts.map(({ label, keys }) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{copy[label]}</dt>
            <dd>
              <KbdCombo>
                {keys.map((key) => (
                  <Kbd key={key} variant="raised">
                    {key}
                  </Kbd>
                ))}
              </KbdCombo>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
