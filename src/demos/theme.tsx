/* Every token group of abnormal.css, drawn from the variables themselves, so this page always shows what ships. */

const surfaces = [
  ["background", "pageSurface"],
  ["surface", "codeChipsFills"],
  ["popover", "menusDialogsSheets"],
  ["sidebar", "navigationColumn"],
  ["hover", "hoveredRows"],
  ["popover-hover", "popoverRows"],
  ["control", "buttonsInputs"],
  ["border", "hairlines"],
  ["input", "inputBorders"],
] as const;

const accents = [
  ["brand", "primaryAction"],
  ["highlight", "chromaticBrand"],
  ["highlight-muted", "selectedRows"],
  ["signal", "dotsProgress"],
  ["focus", "focusOutline"],
] as const;

const statuses = [
  ["success", "enabledSent"],
  ["destructive", "errors"],
  ["badge-ink", "pendingProgress"],
  ["text-secondary", "secondaryText"],
] as const;

const charts = ["chart-1", "chart-2", "chart-3", "chart-4"];
const radii = [
  ["rounded-chip", "chipRadius"],
  ["rounded-control", "controlRadius"],
  ["rounded-mark", "markRadius"],
  ["rounded-panel", "panelRadius"],
  ["rounded-dialog", "dialogRadius"],
] as const;
const shadows = [
  ["shadow-panel", "panelShadow"],
  ["shadow-popover", "popoverShadow"],
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

export const defaultCopy = {
  pageSurface: "The page: warm paper, or the ink itself in dark mode.",
  codeChipsFills: "Code, chips and quiet fills.",
  menusDialogsSheets: "Menus, dialogs and sheets.",
  navigationColumn: "The navigation column.",
  hoveredRows: "Hovered rows; opaque so pinned columns cover what scrolls under them.",
  popoverRows: "Hovered rows inside popovers.",
  buttonsInputs: "Buttons and inputs: translucent ink, the same over any surface.",
  hairlines: "Hairlines between things.",
  inputBorders: "Input borders and the scrollbar.",
  primaryAction: "The primary action: ink in light, paper in dark.",
  chromaticBrand: "The only chromatic brand color: current, selected or new.",
  selectedRows: "Selected rows and the chosen option.",
  dotsProgress: "Dots, progress and numbering: ink in light, yellow in dark.",
  focusOutline: "The keyboard focus outline.",
  enabledSent: "Enabled, sent, connected.",
  errors: "Errors and what cannot be undone.",
  pendingProgress: "Pending and in progress.",
  secondaryText: "Secondary text, 6.9:1 on the page.",
  chipRadius: "4px: badges",
  controlRadius: "6px: buttons and inputs",
  markRadius: "8px: menus and popovers",
  panelRadius: "12px: cards and sheets",
  dialogRadius: "12px: dialogs",
  panelShadow: "Panels: none, layering comes from borders.",
  popoverShadow: "Floating surfaces.",
  surfaces: "Surfaces",
  accents: "Accents",
  status: "Status",
  inkShell: "Ink shell",
  inkShellPrefix: "A navigation column or the frame around the content, in the brand ink in both themes: put ",
  inkShellSuffix:
    " on it and everything inside takes the dark values. The content is a sheet of paper beside it, never inside it.",
  current: "Current",
  anotherPage: "Another page",
  primary: "Primary",
  pageOnPaper: "The page, on paper",
  charts: "Charts",
  chartDescription: "A fixed order; the last two sit below 3:1, so a chart always carries a legend.",
  radii: "Radii",
  shadows: "Shadows",
  type: "Type",
  headingFont: "Bricolage Grotesque for headings",
  interfaceFont: "Inter for everything you read in the interface, with Chinese fallbacks chained in.",
  codeFont: "JetBrains Mono for code and addresses",
  pangram: "The quick brown fox",
  motion: "Motion",
  motionStart: "Enter and exit animations run on ",
  motionMiddle: ", so they never override a centered dialog's ",
  motionEnd: ". Under reduced motion only the spinner keeps turning.",
};

function Swatches({
  title,
  tokens,
  copy,
}: {
  title: string;
  tokens: readonly (readonly [string, string])[];
  copy: typeof defaultCopy;
}) {
  return (
    <div className="grid gap-3">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tokens.map(([token, note]) => (
          <div key={token} className="grid gap-1.5">
            <div className="h-12 rounded-control border border-border" style={{ background: `var(--${token})` }} />
            <code className="font-mono text-xs">{token}</code>
            <p className="text-xs text-muted-foreground">{copy[note as keyof typeof defaultCopy]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ThemeDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full gap-10">
      <Swatches title={copy.surfaces} tokens={surfaces} copy={copy} />
      <Swatches title={copy.accents} tokens={accents} copy={copy} />
      <Swatches title={copy.status} tokens={statuses} copy={copy} />

      <div className="grid gap-3">
        <h3 className="text-sm font-medium">{copy.inkShell}</h3>
        <p className="text-xs text-muted-foreground">
          {copy.inkShellPrefix}
          <code>ink</code>
          {copy.inkShellSuffix}
        </p>
        <div className="flex h-44 gap-2 rounded-panel bg-ink p-2 pl-0">
          <div className="ink flex w-40 shrink-0 flex-col gap-0.5 px-2 text-sm">
            <span className="rounded-control bg-highlight px-3 py-1.5 font-semibold text-highlight-foreground">
              {copy.current}
            </span>
            <span className="rounded-control px-3 py-1.5 text-muted-foreground">{copy.anotherPage}</span>
            <span className="mt-auto rounded-control bg-primary px-3 py-1.5 text-center font-semibold text-primary-foreground">
              {copy.primary}
            </span>
          </div>
          <div className="grid flex-1 place-content-center rounded-panel bg-background text-sm text-muted-foreground">
            {copy.pageOnPaper}
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <h3 className="text-sm font-medium">{copy.charts}</h3>
        <p className="text-xs text-muted-foreground">{copy.chartDescription}</p>
        <div className="flex h-12 gap-1">
          {charts.map((token) => (
            <div key={token} className="flex-1 rounded-control" style={{ background: `var(--${token})` }}>
              <span className="sr-only">{token}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <h3 className="text-sm font-medium">{copy.radii}</h3>
        <div className="flex flex-wrap gap-3">
          {radii.map(([radius, note]) => (
            <div
              key={radius}
              className={`grid size-28 place-content-center gap-1 border border-border bg-surface p-2 text-center ${radius}`}
            >
              <code className="font-mono text-xs">{radius.replace("rounded-", "")}</code>
              <span className="text-xs text-muted-foreground">{copy[note as keyof typeof defaultCopy]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <h3 className="text-sm font-medium">{copy.shadows}</h3>
        <div className="flex flex-wrap gap-6 py-2">
          {shadows.map(([shadow, note]) => (
            <div key={shadow} className={`grid w-44 gap-1 rounded-mark border border-border bg-popover p-3 ${shadow}`}>
              <code className="font-mono text-xs">{shadow}</code>
              <span className="text-xs text-muted-foreground">{copy[note as keyof typeof defaultCopy]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <h3 className="text-sm font-medium">{copy.type}</h3>
        <p className="font-heading text-2xl font-semibold">{copy.headingFont}</p>
        <p className="font-sans">{copy.interfaceFont}</p>
        <p className="font-mono text-sm">{copy.codeFont}</p>
        <div className="grid gap-1 pt-2">
          {sizes.map((size) => (
            <p
              key={size}
              className={`${size} flex items-baseline gap-3 ${size.startsWith("text-display") ? "font-heading font-semibold" : ""}`}
            >
              <code className="w-16 shrink-0 font-mono text-xs text-muted-foreground">{size}</code>
              {copy.pangram}
            </p>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <h3 className="text-sm font-medium">{copy.motion}</h3>
        <p className="text-xs text-muted-foreground">
          {copy.motionStart}
          <code>transform</code>
          {copy.motionMiddle}
          <code>translate</code>
          {copy.motionEnd}
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
