/** The family contract, shared by the HTML guide and its Markdown alternate. Colors stay in abnormal.css. */
export const principles = [
  {
    title: "Paper, ink, one highlighter",
    text: "Keep the warm paper and ink palette. Saturated yellow marks the current location or something new; muted yellow marks a selected content row. Primary actions remain ink on paper, or paper on ink.",
  },
  {
    title: "One surface per task",
    text: "Navigation can stay ink in both themes. Put paper panes beside that ink scope, not inside it. Separate a list, reader or inspector with a gutter or hairline rather than a raised card around every section.",
  },
  {
    title: "Density belongs to the task",
    text: 'Use compact spacing for lists and operational metadata, comfortable spacing for reading and decisions. A product people work in for hours opts into data-ui-density="compact" on the root html element: it tightens spacing first and steps interface type down about a pixel, and only for a mouse or trackpad, so touch targets keep their size. Message bodies and long-form copy keep their reading size.',
  },
  {
    title: "Status is not branding",
    text: "Success stays green, warning stays amber and failure stays red, always with a word or icon. Brand yellow is never a substitute for service health, unread content, keyboard focus or destructive intent.",
  },
] as const;

export const palette = [
  {
    token: "background",
    value: "#f7f7f4",
    className: "bg-background",
    role: "Paper: the page and work surfaces; follows the page theme.",
  },
  {
    token: "foreground",
    value: "#141412",
    className: "bg-foreground",
    role: "Ink: text and primary actions; follows the page theme.",
  },
  {
    token: "ink",
    value: "#141412",
    className: "bg-ink",
    role: "The frame, permanently ink; one step darker than the dark page.",
  },
  {
    token: "highlight",
    value: "#ffe14d",
    className: "bg-highlight",
    role: "Current navigation or a new signal; always use highlight-foreground text.",
  },
  {
    token: "highlight-muted",
    value: "#fff4bf",
    className: "bg-highlight-muted",
    role: "Selected content, not another primary action; uses foreground text.",
  },
  {
    token: "border",
    value: "#e3e3dc",
    className: "bg-border",
    role: "Quiet hairlines instead of repeated cards and shadows.",
  },
] as const;

export const typography = [
  ["Body", "Inter · text-base · 14px", "Everyday copy; text-md with leading-prose for long reading."],
  [
    "Supporting text",
    "text-sm / text-xs · 13px / 12px",
    "Secondary metadata; reserve 11px text-2xs for short counts or timestamps.",
  ],
  ["Product title", "font-heading · text-3xl · 28px", "Bricolage Grotesque with the existing system CJK fallbacks."],
  [
    "Marketing display",
    "font-heading · 34px / 40px / 56px",
    "Editorial emphasis on a website, not oversized headings in every app pane.",
  ],
  ["Data", "font-mono · tabular-nums", "JetBrains Mono for code and identifiers; align comparable numbers."],
] as const;

export const productGuidance = [
  [
    "Website",
    "Expressive, editorial",
    "Keep its current offer and positioning. Use a clear title, a single marked phrase and deliberate product hierarchy; do not turn every section into a dashboard.",
  ],
  [
    "Mail",
    "Quiet reading workspace",
    "Ink navigation and paper list / reading panes. Use muted selection, keep message copy generous, and show contextual tools only where they are needed.",
  ],
  [
    "Doppel",
    "Compact operational workspace",
    "The same shell vocabulary, but scan-friendly lists, stable status columns and an optional inspector. Do not copy a mail reader just to match its layout.",
  ],
  [
    "Status",
    "Trust before decoration",
    "A paper page without a compulsory ink sidebar. Health, history and incidents take priority; green / amber / red keep their meaning.",
  ],
] as const;

export const implementationRules = [
  [
    "Light and dark",
    "Use semantic tokens, ThemeScript and the existing theme preference. Never hard-code a light paper fill in an app pane. Only the navigation takes the permanent ink scope.",
  ],
  [
    "Corners and depth",
    "Keep the existing 4px chip, 6px control, 8px popover and 12px panel radii. Use shadows for floating overlays, not for every work surface.",
  ],
  [
    "Narrow screens",
    "Stack or replace panes according to the product flow. Workspace stacks by default and hides nothing; the product owns mobile navigation, back behavior and independent scrolling. Do not shrink a desktop screenshot to fit.",
  ],
  [
    "Input and focus",
    "Keep names, labels, keyboard access and visible focus. The compact density applies only to a fine pointer: it is a desktop information-density option, not permission to make touch targets smaller.",
  ],
  [
    "Motion",
    "Use the existing short transition tokens for state changes. Respect reduced motion and avoid decorative movement in reading or status views.",
  ],
] as const;

export function designMarkdown() {
  const list = (rows: readonly (readonly string[])[]) =>
    rows.map(([title, ...rest]) => `- **${title}:** ${rest.join(" — ")}`).join("\n");
  return [
    "# Family style: paper-like tool minimalism",
    "Warm paper, ink structure and a restrained yellow highlighter. Shared vocabulary, not one compulsory product layout. This is an additive foundation; existing colors and component defaults are preserved.",
    "## Principles",
    ...principles.map(({ title, text }) => `### ${title}\n\n${text}`),
    "## Palette",
    "Values below are the existing light-theme reference. The same semantic tokens resolve to dark values when the theme changes.",
    ...palette.map(({ token, value, role }) => `- \`${token}\` (${value}): ${role}`),
    "## Type",
    list(typography),
    "## Product character",
    list(productGuidance),
    "## Implementation rules",
    list(implementationRules),
    "## Adopt the foundation",
    "1. Keep the existing theme and fonts; install `@abnormal/workspace` for ink / paper compositions and reinstall `@abnormal/item-list` to opt into compact rows and muted selection.",
    "2. Keep `WorkspaceNavigation` and `WorkspacePane` as siblings. A pane's `padding` is local (`none`, `compact`, `comfortable`); the page owns dimensions, navigation and scrolling.",
    '3. `ItemListRow` accepts `density="compact"` and `selected`. Selection is visual: the product supplies appropriate `aria-current` or `aria-pressed` semantics, not an unrelated ARIA role.',
    "4. Validate real flows in light and dark, wide and narrow, with keyboard and touch before product rollout. The guide's examples are sample data, not product integrations.",
    "The rendered guide and live composition examples are at https://ui.abnormalhq.com/design. Workspace source and install: https://ui.abnormalhq.com/components/workspace. Existing semantic tokens: https://ui.abnormalhq.com/components/theme.",
  ].join("\n\n");
}
