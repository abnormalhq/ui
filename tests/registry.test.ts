import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { test } from "node:test";
import { compile } from "tailwindcss";
import ts from "typescript";

type File = { path: string; type: string; target?: string };
type Item = {
  name: string;
  type: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: File[];
};

const registry: { items: Item[] } = JSON.parse(readFileSync("registry.json", "utf8"));
const theme = readFileSync("registry/styles/abnormal.css", "utf8");
const names = new Set(registry.items.map(({ name }) => name));
const isCode = (path: string) => /\.tsx?$/.test(path);
const code = registry.items.filter(({ files }) => files.some(({ path }) => isCode(path)));
const read = (path: string) => readFileSync(path, "utf8");
/** Every file of an item with code, not only the first: an item can bring several (table brings table-row.ts). */
const sources = (item: Item) =>
  item.files.filter(({ path }) => isCode(path)).map(({ path }) => ({ path, text: read(path) }));
/** Every module a file imports, from comments-aware parsing: `from "x"`, side-effect `import "x"`, `import("x")` and re-exports. */
const importsOf = (text: string) => ts.preProcessFile(text, true, true).importedFiles.map(({ fileName }) => fileName);
/** `@scope/name/sub` and `name/sub` are the packages `@scope/name` and `name`. */
const packageOf = (specifier: string) =>
  specifier
    .split("/")
    .slice(0, specifier.startsWith("@") ? 2 : 1)
    .join("/");
const moduleName = (path: string) => basename(path, extname(path));

test("every item has a source file and a built JSON file that carries all of its files", () => {
  for (const item of registry.items) {
    for (const { path } of item.files) assert.ok(existsSync(path), path);
    const built: { files: { path: string; content: string }[] } = JSON.parse(read(`public/r/${item.name}.json`));
    assert.deepEqual(
      built.files.map(({ path, content }) => ({ path, content })),
      item.files.map(({ path }) => ({ path, content: read(path) })),
      item.name,
    );
  }
});

test("every file under registry/ belongs to exactly one item", () => {
  const listed = registry.items.flatMap(({ files }) => files.map(({ path }) => path));
  const onDisk = readdirSync("registry", { recursive: true, encoding: "utf8" })
    .map((path) => join("registry", path))
    .filter((path) => extname(path) !== "");
  assert.deepEqual(listed.toSorted(), onDisk.toSorted());
});

test("registry dependencies point at items in this registry", () => {
  for (const item of registry.items) {
    for (const dependency of item.registryDependencies ?? []) {
      assert.match(dependency, /^@abnormal\//, `${item.name} -> ${dependency}`);
      assert.ok(names.has(dependency.replace("@abnormal/", "")), `${item.name} -> ${dependency}`);
    }
  }
});

test("items declare exactly what their files import", () => {
  for (const item of code) {
    const own = new Set(item.files.map(({ path }) => moduleName(path)));
    const internal = new Set(item.name === "utils" ? [] : ["@abnormal/utils"]);
    const external = new Set<string>();
    for (const { path, text } of sources(item)) {
      for (const specifier of importsOf(text)) {
        assert.doesNotMatch(specifier, /^\./, `${path}: relative imports are not rewritten on install`);
        const component = specifier.match(/^@\/components\/ui\/([a-z-]+)$/)?.[1];
        if (specifier === "@/lib/utils") internal.add("@abnormal/utils");
        else if (component && !own.has(component)) internal.add(`@abnormal/${component}`);
        else if (!specifier.startsWith("@/")) external.add(packageOf(specifier));
      }
    }
    assert.deepEqual((item.registryDependencies ?? []).toSorted(), [...internal].sort(), item.name);

    for (const name of ["react", "react-dom"]) external.delete(name);
    const declared = (item.dependencies ?? []).map((name) => name.replace(/(?!^)@[^@/]+$/, ""));
    assert.deepEqual(declared.toSorted(), [...external].sort(), item.name);
  }
});

test("the import scan sees scoped packages, side-effect imports and comments", () => {
  const text = [
    'import { flexRender } from "@tanstack/react-table/build";',
    'import "sonner/dist/styles.css";',
    'import type { Foo } from "foo";',
    '// import { gone } from "commented-out";',
  ].join("\n");
  assert.deepEqual(importsOf(text).map(packageOf), ["@tanstack/react-table", "sonner", "foo"]);
  assert.equal("@scope/name@^1.2.0".replace(/(?!^)@[^@/]+$/, ""), "@scope/name");
});

test("components stay generic: no product code, framework router or copy", () => {
  for (const item of code) {
    for (const { path, text } of sources(item)) {
      for (const specifier of importsOf(text).filter((specifier) => specifier.startsWith("@/"))) {
        assert.match(specifier, /^@\/(lib\/utils|components\/ui\/)/, `${path}: ${specifier}`);
      }
      assert.ok(!importsOf(text).some((specifier) => specifier.startsWith("next/")), path);
      // Labels come in through props: no `closeLabel = "Close"` style default, and no literal aria-label.
      assert.doesNotMatch(text, /\b\w*[lL]abel\s*=\s*["'`]/, `${path}: a label prop has a built-in default`);
      assert.doesNotMatch(text, /aria-label="/, `${path}: a literal aria-label`);
    }
  }
});

test('a "use client" file exports components only', () => {
  // A Server Component gets every export of such a file as a client reference: a class string arrives as an object
  // that cn drops, and a helper cannot be called. Helpers go in a file without the directive.
  for (const item of code) {
    for (const { path, text } of sources(item)) {
      if (!/^["']use client["']/.test(text)) continue;
      const file = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const exported: string[] = [];
      for (const statement of file.statements) {
        if (ts.isExportDeclaration(statement) && !statement.isTypeOnly && statement.exportClause) {
          if (!ts.isNamedExports(statement.exportClause)) continue;
          for (const element of statement.exportClause.elements)
            if (!element.isTypeOnly) exported.push(element.name.text);
        }
        const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) : undefined;
        if (!modifiers?.some(({ kind }) => kind === ts.SyntaxKind.ExportKeyword)) continue;
        if (ts.isFunctionDeclaration(statement) && statement.name) exported.push(statement.name.text);
        if (ts.isVariableStatement(statement)) {
          for (const { name } of statement.declarationList.declarations)
            if (ts.isIdentifier(name)) exported.push(name.text);
        }
      }
      for (const name of exported) assert.match(name, /^[A-Z]/, `${path} exports ${name}`);
    }
  }
});

test("cn knows every custom token in the theme", () => {
  const utils = read("registry/lib/utils.ts");
  const listed = (key: string) =>
    [...utils.match(new RegExp(`${key}: \\[([^\\]]*)\\]`))![1]!.matchAll(/"([^"]+)"/g)].map((m) => m[1]!);
  const tokens = (prefix: string) => [...theme.matchAll(new RegExp(`--${prefix}-([a-z-]+):`, "g"))].map((m) => m[1]!);
  assert.deepEqual(listed("radius").toSorted(), tokens("radius").toSorted());
  assert.deepEqual(listed("shadow").toSorted(), tokens("shadow").toSorted());
  assert.deepEqual(listed("animate").toSorted(), tokens("animate").toSorted());
});

test("the dark values match between the data-theme rule and the system preference fallback", () => {
  const values = (block: string) =>
    [...block.matchAll(/(--[a-z0-9-]+): ([^;]+);/g)].map(([, name, value]) => `${name}=${value}`);
  const forced = theme.match(/:root\[data-theme="dark"\] \{([\s\S]*?)\n\}/)![1]!;
  const system = theme.match(/:root:not\(\[data-theme="light"\]\) \{([\s\S]*?)\n  \}/)![1]!;
  assert.deepEqual(values(system), values(forced));
});

test("dark: utilities follow the same rule as the dark tokens", async () => {
  const compiler = await compile(`${theme}\n@tailwind utilities;`, {
    base: process.cwd(),
    loadStylesheet: async () => ({ path: "", base: "", content: "" }),
  });
  const css = compiler.build(["dark:bg-background"]);
  const rules = [...css.matchAll(/\.dark\\:bg-background([^{]*)\{/g)].map(([, selector]) => selector!.trim());
  assert.deepEqual(rules, [
    ':where([data-theme="dark"], [data-theme="dark"] *)',
    ':where(:root:not([data-theme="light"]), :root:not([data-theme="light"]) *)',
  ]);
  // The second one only applies on a dark system, exactly like the token fallback.
  const media = css.slice(0, css.indexOf(rules[1]!));
  assert.ok(media.lastIndexOf("@media (prefers-color-scheme: dark)") > media.lastIndexOf("}"), css);
});

test("phone inputs stay at 16px outside any layer", () => {
  const rule = theme.lastIndexOf('[data-slot="native-select"]');
  assert.ok(rule > theme.lastIndexOf("@layer base"));
  assert.ok(theme.slice(theme.lastIndexOf("}\n\n", rule)).startsWith("}\n\n"));
});
