import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { test } from "node:test";
import { groups } from "../src/groups.ts";
import { type CodeLang, highlight } from "../src/highlight.ts";

const registry: { items: { name: string }[] } = JSON.parse(readFileSync("registry.json", "utf8"));
const names = registry.items.map(({ name }) => name);

test("every registry item is in exactly one group", () => {
  assert.deepEqual(groups.flatMap(({ items }) => items).toSorted(), names.toSorted());
});

test("the export has a page and a client navigation payload for every registry item", () => {
  for (const name of names) {
    assert.ok(existsSync(`out/components/${name}.html`), name);
    assert.ok(existsSync(`out/components/${name}.txt`), name);
  }
  assert.ok(existsSync("out/404.html"));
});

test("the exported table page keeps the row action classes", () => {
  // The demo is a Server Component. rowActionClassName once came from the "use client" table.tsx, reached it as a
  // client reference, and the buttons rendered without these classes.
  const html = readFileSync("out/components/table.html", "utf8");
  const buttons = [...html.matchAll(/<button(?:\s+[\w-]+(?:="[^"]*")?)*/g)]
    .map(([tag]) => tag)
    .filter((tag) => tag.includes('aria-label="More for '));
  assert.equal(buttons.length, 6, "three rows in each of the two tables");
  for (const tag of buttons) assert.match(tag, /group-hover\/row:opacity-100/);
});

test("every registry item has a demo, and every demo has an item", () => {
  for (const name of names) assert.ok(existsSync(`src/demos/${name}.tsx`), name);
  for (const file of readdirSync("src/demos")) assert.ok(names.includes(file.replace(/\.tsx$/, "")), file);
});

test("every code language highlights into the theme's variables", async () => {
  const samples: Record<CodeLang, string> = {
    bash: "pnpm dlx shadcn@latest add @abnormal/button",
    css: '@import "tailwindcss";',
    json: '{ "name": "abnormal" }',
    ts: "const name: string = 'abnormal';",
    tsx: "export const Name = () => <b>abnormal</b>;",
  };
  for (const [lang, code] of Object.entries(samples)) {
    const html = await highlight(code, lang as CodeLang);
    assert.match(html, /color:var\(--shiki-token-/, lang);
    assert.doesNotMatch(html, /<pre/, lang);
  }
});

test("the item pages read the design notes and the cva variants out of the sources", async () => {
  const { designNotes, variantsOf } = await import("../src/notes.ts");
  const button = readFileSync("registry/ui/button.tsx", "utf8");
  assert.match(designNotes(button)[0]!, /^A uniform 32px height/);
  assert.deepEqual(variantsOf(button), [
    {
      name: "variant",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
      defaultOption: "default",
    },
    {
      name: "size",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
      defaultOption: "default",
    },
  ]);
  // Class strings carry "hover:" and comments carry "progress:", and neither is a variant.
  const label = readFileSync("registry/ui/status-label.tsx", "utf8");
  assert.deepEqual(
    variantsOf(label).map(({ name, options }) => [name, options]),
    [
      ["variant", ["badge", "dot"]],
      ["tone", ["pending", "success", "muted", "destructive"]],
    ],
  );
  assert.deepEqual(variantsOf(readFileSync("registry/ui/table.tsx", "utf8")), []);
  // Every page and its Markdown show them.
  const html = readFileSync("out/components/button.html", "utf8");
  assert.match(html, /Design notes/);
  assert.match(html, /A uniform 32px height/);
  assert.match(readFileSync("out/md/components/button.md", "utf8"), /## Variants\n\n- `variant`: `default`, `outline`/);
});
