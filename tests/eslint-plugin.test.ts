import assert from "node:assert/strict";
import { test } from "node:test";
import css from "@eslint/css";
import { Linter } from "eslint";
import { tailwind4 } from "tailwind-csstree";
import abnormal, { checkClass } from "../registry/lib/eslint-plugin-abnormal.mjs";

test("classes with hand-picked values are reported, with the theme's name to use instead", () => {
  const reported: Record<string, RegExp> = {
    "text-zinc-500": /semantic color/,
    "hover:bg-sky-500/12": /category hue/,
    "dark:text-amber-400": /without dark:/,
    "bg-[#f7f7f4]": /theme color/,
    "bg-black/40": /bg-overlay/,
    "text-[13px]": /type scale/,
    "md:mt-[18px]": /mt-4\.5/,
    "rounded-md": /rounded-control/,
    "rounded-[5px]": /rounded-chip/,
    "text-[13px]/6": /type scale/,
    "text-[13px]/[1.35]": /type scale/,
    "text-[length:13px]": /type scale/,
    "text-zinc-500/[.5]": /semantic color/,
    "[&_h2]:mt-[3.25rem]": /\[&_h2\]:mt-13\)/,
    "z-60": /stacking scale/,
    "shadow-lg": /shadow-popover/,
    "z-50": /stacking scale/,
    "z-[60]": /stacking scale/,
    "tracking-[-0.02em]": /tracking-heading/,
  };
  for (const [token, message] of Object.entries(reported)) assert.match(checkClass(token) ?? "", message, token);
  for (const token of [
    "text-muted-foreground",
    "bg-category-blue-soft",
    "dark:hidden",
    "mt-4.5",
    "rounded-control",
    "rounded-[1px]",
    "rounded-xs",
    "rounded-[999px]",
    "@max-md:text-[0px]",
    "z-overlay",
    "z-[2]",
    "-z-10",
    "border-[color-mix(in_oklab,var(--brand)_55%,var(--border))]",
    "max-w-[14em]",
    "mt-[2px]",
    "mt-[0.2rem]",
    "z-9",
  ])
    assert.equal(checkClass(token), undefined, token);
});

test("the class rule reads class strings and style objects in TSX", () => {
  const linter = new Linter();
  const messages = linter.verify(
    'const a = cn("p-3 text-zinc-500", ok && `z-50`);\nconst b = <div className="text-sm" style={{ color: "#fff", width: 3 }} />;\nimport x from "text-red-500";\n// abnormal-allow: a printed page stays white\nconst c = "bg-white";\nconst d = "bg-white";\nconst e = <div style={{ color: `#fed`, width: `${w}px`, fill: `url(#fade)`, stroke: "url(#abc)" }} />;',
    {
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: { abnormal },
      rules: { "abnormal/no-hardcoded-classes": "error" },
    },
  );
  assert.deepEqual(
    messages.map(({ line, message }) => [line, message.split(":")[0]]),
    [
      [1, '"text-zinc-500"'],
      [1, '"z-50"'],
      [2, '"#fff"'],
      [6, '"bg-white"'],
      [7, '"#fed"'],
    ],
  );
});

test("the CSS rule reports literal colors, sizes, spacing, radii and layers, but not custom properties", () => {
  const linter = new Linter({ configType: "flat" });
  const source = [
    ".a { --own: #ffe14d; color: #111; background: rgb(20 20 18 / 72%); }",
    ".b { font-size: 12px; padding: 8px 1px; margin: --spacing(2); border-radius: 6px; z-index: 40; }",
    ".c { font-size: var(--text-sm); padding: 1px 2px; border-radius: 2px; z-index: 3; color: var(--text); }",
    "@theme { --breakpoint-phone: 23.8125rem; }",
    '.d { border-radius: 999px; mask: url(#fade); content: "#404"; }',
    ".e { @apply hover:bg-background; padding: 8px; }",
    "@utility badge { color: #111; &:hover { color: var(--text); } }",
    "/* abnormal-allow: a printed page stays white */",
    ".f { background: #fff; }",
    ".g { font: 10px var(--font-mono); }",
    ".h { font: var(--text-2xs)/1.4 var(--font-mono); }",
    '.i { font: var(--text-sm) / 18px "Mono 12px", monospace; background: url("a).png") center, #fff url("b.png"); }',
    ".j { font: calc(1rem + 2px) sans-serif; gap: max( 12px, 1vw); }",
    ".k { font: 16PX sans-serif; margin: max(12px, 1vw); }",
    ".l { font: clamp(0.75rem, calc(var(--text-sm) + 1vw), 1rem) system-ui; line-height: 1; }",
    '.m { font: var(--text-xs)/calc(1em + 2px) monospace; background: url("a\\").png") #fff; }',
    ".n { background: url(a\\'b.png), linear-gradient(#fff, #000), url('c.png'); }",
    '.o { content: "\\\n#fff"; }',
    ".p { padding: 0 /* don't add vertical padding */ 16px; color: var(--text) /* #fff */; }",
    ".q { border-radius: var(--radius-control) /* not 8px */; z-index: 40 /* above the header */; }",
    ".r { border-radius: calc(var(--radius-panel) + -4px); }",
    ".s { border-radius: var(--圆角-4px); padding: var(--间距-8px); margin: var(--e\u03018px); }",
  ].join("\n");
  const messages = linter.verify(
    source,
    [
      {
        files: ["**/*.css"],
        language: "css/css",
        languageOptions: { customSyntax: tailwind4 },
        plugins: { css, abnormal },
        rules: { "abnormal/no-hardcoded-css": "error" },
      },
    ],
    "a.css",
  );
  assert.deepEqual(
    messages.map(({ line, message }) => [line, message.split(":")[0]]),
    [
      [1, "color"],
      [1, "background"],
      [2, "font-size"],
      [2, "padding"],
      [2, "border-radius"],
      [2, "z-index"],
      [6, "padding"],
      [7, "color"],
      [10, "font"],
      [12, "background"],
      [13, "font"],
      [13, "gap"],
      [14, "font"],
      [14, "margin"],
      [16, "background"],
      [17, "background"],
      [20, "padding"],
      [21, "z-index"],
      [22, "border-radius"],
    ],
  );
});

test("native titles are reported on HTML elements and the components that pass them on, not where title names a frame", () => {
  const linter = new Linter();
  const messages = linter.verify(
    [
      'const a = <button title="Archive" aria-label="Archive" />;',
      'const b = <span className="truncate" title={subject}>{subject}</span>;',
      'const c = <Button title="Export">Export</Button>;',
      'const d = <iframe title="Preview" src="/p" />;',
      'const e = <PageHeader title="Mailboxes" />;',
      "// abnormal-allow: a printed page has no pointer",
      'const f = <span title="Printed" />;',
      'const g = <abbr title="Domain-based Message Authentication">DMARC</abbr>;',
    ].join("\n"),
    {
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: { abnormal },
      rules: { "abnormal/no-native-title": "error" },
    },
  );
  assert.deepEqual(
    messages.map(({ line }) => line),
    [1, 2, 3],
  );
  assert.match(messages[0]!.message, /LabelTooltip/);
});

test("icon buttons need IconButton or a tooltip around them", () => {
  const linter = new Linter();
  const messages = linter.verify(
    [
      'const a = <Button size="icon-sm" aria-label="Close"><XIcon /></Button>;',
      'const b = <IconButton size="icon-sm" label="Close"><XIcon /></IconButton>;',
      'const c = <button type="button" aria-label="Clear"><XIcon /></button>;',
      'const d = <button type="button"><XIcon /><span className="sr-only">Clear</span></button>;',
      'const e = <button type="button">Save</button>;',
      'const f = <button type="button">{label}</button>;',
      'const g = <LabelTooltip label="Clear"><button type="button" aria-label="Clear"><XIcon /></button></LabelTooltip>;',
      'const h = <TooltipTrigger asChild><Button size="icon" aria-label="Help"><HelpIcon /></Button></TooltipTrigger>;',
      "const i = <button {...props} />;",
      'const j = <Button size="sm">Save</Button>;',
    ].join("\n"),
    {
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: { abnormal },
      rules: { "abnormal/icon-button-label": "error" },
    },
  );
  assert.deepEqual(
    messages.map(({ line }) => line),
    [1, 3, 4],
  );
  assert.match(messages[0]!.message, /IconButton/);
});
