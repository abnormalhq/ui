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
    'const a = cn("p-3 text-zinc-500", ok && `z-50`);\nconst b = <div className="text-sm" style={{ color: "#fff", width: 3 }} />;\nimport x from "text-red-500";\n// abnormal-allow: a printed page stays white\nconst c = "bg-white";\nconst d = "bg-white";',
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
    ],
  );
});
