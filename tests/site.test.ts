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
