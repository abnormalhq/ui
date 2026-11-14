/*
 * Which items ship client JavaScript. lucide-react's icon component (dist/esm/Icon.mjs) is a "use client" module, so in
 * Next.js a page that imports any module importing lucide-react sends a client script, even when nothing interactive
 * renders. An item that is otherwise server-only (no "use client" in its files or in the registry modules they import)
 * draws its icons inline instead.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

type Item = { name: string; files: { path: string }[] };
const registry: { items: Item[] } = JSON.parse(readFileSync("registry.json", "utf8"));
const folders = ["registry/ui", "registry/marketing", "registry/brand"];

/** Where `@/components/ui/<name>` resolves, as tsconfig.json's paths say. */
const resolve = (name: string) =>
  folders.flatMap((folder) => [`${folder}/${name}.tsx`, `${folder}/${name}.ts`]).find((path) => existsSync(path));

const isClient = (text: string) => {
  const file = ts.createSourceFile("x.tsx", text, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX);
  for (const statement of file.statements) {
    if (!ts.isExpressionStatement(statement) || !ts.isStringLiteral(statement.expression)) break;
    if (statement.expression.text === "use client") return true;
  }
  return false;
};

/** Every registry file an item's files reach through `@/components/ui/*`, with the packages each one imports. */
function closure(paths: string[], read: (path: string) => string) {
  const files = new Map<string, string[]>();
  const visit = (path: string) => {
    if (files.has(path)) return;
    const imports = ts.preProcessFile(read(path), true, true).importedFiles.map(({ fileName }) => fileName);
    files.set(path, imports);
    for (const specifier of imports) {
      const name = specifier.match(/^@\/components\/ui\/([a-z-]+)$/)?.[1];
      const target = name && resolve(name);
      if (target) visit(target);
    }
  };
  for (const path of paths) visit(path);
  return files;
}

/** The items that render with no client module but import lucide-react somewhere in that closure, as messages. */
function serverItemsWithLucide(items: Item[], read: (path: string) => string) {
  const problems: string[] = [];
  for (const item of items) {
    const files = closure(
      item.files.map(({ path }) => path).filter((path) => /\.tsx?$/.test(path)),
      read,
    );
    if ([...files.keys()].some((path) => isClient(read(path)))) continue;
    for (const [path, imports] of files) {
      if (imports.some((specifier) => specifier === "lucide-react" || specifier.startsWith("lucide-react/"))) {
        problems.push(`${item.name}: ${path} imports lucide-react`);
      }
    }
  }
  return problems;
}

const read = (path: string) => readFileSync(path, "utf8");

test("an item with no client module in it imports no lucide-react, directly or through another item", () => {
  assert.deepEqual(serverItemsWithLucide(registry.items, read), []);
});

test("the client module check follows imports and the directive", () => {
  const sources: Record<string, string> = {
    "a.tsx": 'import { XIcon } from "lucide-react";',
    "b.tsx": '"use client";\nimport { XIcon } from "lucide-react";',
    "c.tsx": 'import { Button } from "@/components/ui/button";\nimport { XIcon } from "lucide-react";',
    "d.tsx": '// A comment first.\n"use client";\nexport function D() {}',
  };
  const fake = (path: string) => sources[path] ?? read(path);
  const item = (name: string, path: string) => ({ name, files: [{ path }] });
  assert.deepEqual(serverItemsWithLucide([item("a", "a.tsx")], fake), ["a: a.tsx imports lucide-react"]);
  assert.deepEqual(serverItemsWithLucide([item("b", "b.tsx")], fake), []);
  // Button and its spinner carry no directive, so they do not excuse the icon.
  assert.deepEqual(serverItemsWithLucide([item("c", "c.tsx")], fake), ["c: c.tsx imports lucide-react"]);
  assert.equal(isClient(sources["d.tsx"]!), true);
  // Through another registry module: selection-bar reaches the client checkbox, which exempts it.
  assert.ok(closure(["registry/ui/selection-bar.tsx"], read).has("registry/ui/checkbox.tsx"));
});
