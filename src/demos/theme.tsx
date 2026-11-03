const colors = [
  "background",
  "foreground",
  "surface",
  "muted",
  "primary",
  "brand",
  "highlight",
  "signal",
  "success",
  "destructive",
  "border",
  "input",
];
const radii = ["rounded-chip", "rounded-control", "rounded-mark", "rounded-panel"];
const sizes = ["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl"];

export default function ThemeDemo() {
  return (
    <div className="grid w-full gap-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {colors.map((color) => (
          <div key={color} className="grid gap-1.5">
            <div className="h-12 rounded-control border border-border" style={{ background: `var(--${color})` }} />
            <code className="font-mono text-xs text-muted-foreground">{color}</code>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {radii.map((radius) => (
          <div key={radius} className={`grid size-24 place-items-center border border-border bg-surface ${radius}`}>
            <code className="font-mono text-xs text-muted-foreground">{radius.replace("rounded-", "")}</code>
          </div>
        ))}
      </div>
      <div className="grid gap-2">
        {sizes.map((size) => (
          <p key={size} className={size}>
            {size}: the quick brown fox
          </p>
        ))}
      </div>
    </div>
  );
}
