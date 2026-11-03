import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

type Item = {
  name: string;
  type: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: { path: string; type: string; target?: string }[];
};

const registry: { items: Item[] } = JSON.parse(readFileSync("registry.json", "utf8"));
const theme = readFileSync("registry/styles/abnormal.css", "utf8");
const names = new Set(registry.items.map(({ name }) => name));
const code = registry.items.filter(({ files }) => files.some(({ path }) => /\.tsx?$/.test(path)));
const source = (item: Item) => readFileSync(item.files[0]!.path, "utf8");

test("every item has a source file and a built JSON file", () => {
  for (const item of registry.items) {
    for (const { path } of item.files) assert.ok(existsSync(path), path);
    assert.ok(existsSync(`public/r/${item.name}.json`), item.name);
  }
});

test("registry dependencies point at items in this registry", () => {
  for (const item of registry.items) {
    for (const dependency of item.registryDependencies ?? []) {
      assert.match(dependency, /^@abnormal\//, `${item.name} -> ${dependency}`);
      assert.ok(names.has(dependency.replace("@abnormal/", "")), `${item.name} -> ${dependency}`);
    }
  }
});

test("items declare exactly what their source imports", () => {
  for (const item of code) {
    const text = source(item);
    const internal = [...text.matchAll(/from "@\/components\/ui\/([a-z-]+)"/g)].map(([, name]) => `@abnormal/${name}`);
    if (item.name !== "utils") internal.push("@abnormal/utils");
    assert.deepEqual((item.registryDependencies ?? []).toSorted(), [...new Set(internal)].sort(), item.name);

    const external = [...text.matchAll(/from "([^"@./][^"]*)"/g)]
      .map(([, name]) => name!)
      .filter((name) => name !== "react" && name !== "react-dom");
    const declared = (item.dependencies ?? []).map((name) => name.replace(/@[^@/]+$/, ""));
    const expected = item.name === "utils" ? ["cn"] : [...new Set(external)].sort();
    assert.deepEqual(declared.toSorted(), expected, item.name);
  }
});

test("components stay generic: no product code, framework router or copy", () => {
  for (const item of code) {
    const imports = [...source(item).matchAll(/from "(@\/[^"]+)"/g)].map(([, path]) => path!);
    for (const path of imports) assert.match(path, /^@\/(lib\/utils|components\/ui\/)/, `${item.name}: ${path}`);
    assert.doesNotMatch(source(item), /from "next\//, item.name);
  }
});

test("cn knows every custom token in the theme", () => {
  const utils = readFileSync("registry/lib/utils.ts", "utf8");
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

test("phone inputs stay at 16px outside any layer", () => {
  const rule = theme.lastIndexOf('[data-slot="native-select"]');
  assert.ok(rule > theme.lastIndexOf("@layer base"));
  assert.ok(theme.slice(theme.lastIndexOf("}\n\n", rule)).startsWith("}\n\n"));
});
