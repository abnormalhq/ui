/* Every token group of abnormal.css, drawn from the variables themselves, so this page always shows what ships. */

const surfaces = [
  ["background", "The page: warm paper, or the ink itself in dark mode."],
  ["surface", "Code, chips and quiet fills."],
  ["popover", "Menus, dialogs and sheets."],
  ["sidebar", "The navigation column."],
  ["hover", "Hovered rows; opaque so pinned columns cover what scrolls under them."],
  ["popover-hover", "Hovered rows inside popovers."],
  ["control", "Buttons and inputs: translucent ink, the same over any surface."],
  ["border", "Hairlines between things."],
  ["input", "Input borders and the scrollbar."],
] as const;

const accents = [
  ["brand", "The primary action: ink in light, paper in dark."],
  ["highlight", "The only chromatic brand color: current, selected or new."],
  ["highlight-muted", "Selected rows and the chosen option."],
  ["signal", "Dots, progress and numbering: ink in light, yellow in dark."],
  ["focus", "The keyboard focus outline."],
] as const;

const statuses = [
  ["success", "Enabled, sent, connected."],
  ["destructive", "Errors and what cannot be undone."],
  ["badge-ink", "Pending and in progress."],
  ["text-secondary", "Secondary text, 6.9:1 on the page."],
] as const;

const charts = ["chart-1", "chart-2", "chart-3", "chart-4"];
const radii = [
  ["rounded-chip", "4px: badges"],
  ["rounded-control", "6px: buttons and inputs"],
  ["rounded-mark", "8px: menus and popovers"],
  ["rounded-panel", "12px: cards and sheets"],
  ["rounded-dialog", "12px: dialogs"],
] as const;
const shadows = [
  ["shadow-panel", "Panels: none, layering comes from borders."],
  ["shadow-popover", "Floating surfaces."],
] as const;
const sizes = [
  "text-2xs",
  "text-xs",
  "text-sm",
  "text-base",
  "text-md",
  "text-lg",
  "text-xl",
  "text-2xl",
  "text-3xl",
  "text-4xl",
  "text-display-sm",
  "text-display",
  "text-display-lg",
];
const animations = [
  "arrive",
  "leave",
  "fade-in",
  "fade-out",
  "slide-in-right",
  "slide-out-right",
  "slide-in-left",
  "slide-out-left",
  "slide-in-bottom",
  "slide-out-bottom",
  "flash",
  "pop",
  "progress-sweep",
];

function Swatches({ title, tokens }: { title: string; tokens: readonly (readonly [string, string])[] }) {
  return (
    <div className="grid gap-3">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tokens.map(([token, note]) => (
          <div key={token} className="grid gap-1.5">
            <div className="h-12 rounded-control border border-border" style={{ background: `var(--${token})` }} />
            <code className="font-mono text-xs">{token}</code>
            <p className="text-xs text-muted-foreground">{note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ThemeDemo() {
  return (
    <div className="grid w-full gap-10">
      <Swatches title="Surfaces" tokens={surfaces} />
      <Swatches title="Accents" tokens={accents} />
      <Swatches title="Status" tokens={statuses} />

      <div className="grid gap-3">
        <h3 className="text-sm font-medium">Ink shell</h3>
        <p className="text-xs text-muted-foreground">
          A navigation column or the frame around the content, in the brand ink in both themes: put <code>ink</code> on
          it and everything inside takes the dark values. The content is a sheet of paper beside it, never inside it.
        </p>
        <div className="flex h-44 gap-2 rounded-panel bg-ink p-2 pl-0">
          <div className="ink flex w-40 shrink-0 flex-col gap-0.5 px-2 text-sm">
            <span className="rounded-control bg-highlight px-3 py-1.5 font-semibold text-highlight-foreground">
              Current
            </span>
            <span className="rounded-control px-3 py-1.5 text-muted-foreground">Another page</span>
            <span className="mt-auto rounded-control bg-primary px-3 py-1.5 text-center font-semibold text-primary-foreground">
              Primary
            </span>
          </div>
          <div className="grid flex-1 place-content-center rounded-panel bg-background text-sm text-muted-foreground">
            The page, on paper
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <h3 className="text-sm font-medium">Charts</h3>
        <p className="text-xs text-muted-foreground">
          A fixed order; the last two sit below 3:1, so a chart always carries a legend.
        </p>
        <div className="flex h-12 gap-1">
          {charts.map((token) => (
            <div key={token} className="flex-1 rounded-control" style={{ background: `var(--${token})` }}>
              <span className="sr-only">{token}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <h3 className="text-sm font-medium">Radii</h3>
        <div className="flex flex-wrap gap-3">
          {radii.map(([radius, note]) => (
            <div
              key={radius}
              className={`grid size-28 place-content-center gap-1 border border-border bg-surface p-2 text-center ${radius}`}
            >
              <code className="font-mono text-xs">{radius.replace("rounded-", "")}</code>
              <span className="text-xs text-muted-foreground">{note}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <h3 className="text-sm font-medium">Shadows</h3>
        <div className="flex flex-wrap gap-6 py-2">
          {shadows.map(([shadow, note]) => (
            <div key={shadow} className={`grid w-44 gap-1 rounded-mark border border-border bg-popover p-3 ${shadow}`}>
              <code className="font-mono text-xs">{shadow}</code>
              <span className="text-xs text-muted-foreground">{note}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <h3 className="text-sm font-medium">Type</h3>
        <p className="font-heading text-2xl font-semibold">Bricolage Grotesque for headings</p>
        <p className="font-sans">Inter for everything you read in the interface, with Chinese fallbacks chained in.</p>
        <p className="font-mono text-sm">JetBrains Mono for code and addresses</p>
        <div className="grid gap-1 pt-2">
          {sizes.map((size) => (
            <p key={size} className={`${size} flex items-baseline gap-3`}>
              <code className="w-16 shrink-0 font-mono text-xs text-muted-foreground">{size}</code>
              The quick brown fox
            </p>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <h3 className="text-sm font-medium">Motion</h3>
        <p className="text-xs text-muted-foreground">
          Enter and exit animations run on transform, so they never override a centered dialog&apos;s translate. Under
          reduced motion only the spinner keeps turning.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {animations.map((name) => (
            <code key={name} className="rounded-chip bg-surface px-2 py-1 font-mono text-xs">
              animate-{name}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
}
