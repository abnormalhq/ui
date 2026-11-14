import { Kbd, KbdCombo } from "@/components/ui/kbd";

const shortcuts = [
  { label: "Search", keys: ["/"] },
  { label: "Command palette", keys: ["⌘", "K"] },
  { label: "Archive", keys: ["E"] },
  { label: "Go to inbox", keys: ["G", "I"] },
];

export default function KbdDemo() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <p className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          Navigate
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>↵</Kbd>
          Open
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>Esc</Kbd>
          Close
        </span>
      </p>
      <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 text-sm">
        {shortcuts.map(({ label, keys }) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
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
