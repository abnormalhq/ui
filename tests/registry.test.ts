import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { test } from "node:test";
import { compile } from "tailwindcss";
import ts from "typescript";
import { satisfies } from "./support/semver.ts";

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
/** The item each module under @/components/ui belongs to: table-row.ts is part of table, so importing it needs @abnormal/table. */
const itemOf = new Map(
  registry.items.flatMap((item) =>
    item.files.filter(({ path }) => isCode(path)).map(({ path }) => [moduleName(path), item.name]),
  ),
);

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
        else if (component && !own.has(component)) internal.add(`@abnormal/${itemOf.get(component) ?? component}`);
        else if (!specifier.startsWith("@/")) external.add(packageOf(specifier));
      }
    }
    assert.deepEqual((item.registryDependencies ?? []).toSorted(), [...internal].sort(), item.name);

    for (const name of ["react", "react-dom"]) external.delete(name);
    const declared = (item.dependencies ?? []).map((name) => name.replace(/(?!^)@[^@/]+$/, ""));
    assert.deepEqual(declared.toSorted(), [...external].sort(), item.name);
  }
});

test("a dependency's version floor is the version this site is built and tested with", () => {
  // The site checks the items against its own installs; a looser floor would let a project run them on an older
  // release (with cn, other class-merge tables) than the one tested here. Raise both together.
  const manifest = JSON.parse(read("package.json"));
  const site = { ...manifest.dependencies, ...manifest.devDependencies };
  for (const item of registry.items) {
    for (const dependency of item.dependencies ?? []) {
      const range = dependency.match(/(?!^)@([^@/]+)$/)?.[1];
      if (!range) continue;
      const name = dependency.slice(0, -range.length - 1);
      assert.equal(range, site[name], `${item.name}: ${dependency} against package.json`);
      const installed: string = JSON.parse(read(join("node_modules", name, "package.json"))).version;
      assert.ok(satisfies(installed, range), `${item.name}: ${dependency} against the installed ${installed}`);
    }
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

const isText = (node: ts.Node | undefined) =>
  node !== undefined &&
  (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node));
/** closeLabel, props.label, aria-label: a name that carries words a screen reader speaks. */
const isLabelName = (node: ts.Node | undefined) =>
  node !== undefined &&
  /label$/i.test(ts.isPropertyAccessExpression(node) ? node.name.text : ts.isIdentifier(node) ? node.text : "");

/**
 * Words a component would speak in one language whatever the project's language is, as messages: a label prop's
 * default (`closeLabel = "Close"`), a fallback (`closeLabel ?? "Close"`, `label || "Close"`, `label ? label : "Close"`),
 * a literal label attribute (`aria-label="Close"`, `aria-label={"Close"}`) and literal screen-reader-only text.
 */
function builtInLabels(path: string, text: string) {
  const file = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const problems: string[] = [];
  const report = (node: ts.Node) => problems.push(`${path}: ${node.getText()}`);
  const visit = (node: ts.Node) => {
    if ((ts.isBindingElement(node) || ts.isParameter(node)) && isLabelName(node.name) && isText(node.initializer)) {
      report(node);
    } else if (
      ts.isBinaryExpression(node) &&
      [ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken].includes(node.operatorToken.kind) &&
      isLabelName(node.left) &&
      isText(node.right)
    ) {
      report(node);
    } else if (
      ts.isConditionalExpression(node) &&
      isLabelName(node.condition) &&
      [node.whenTrue, node.whenFalse].some(isText)
    ) {
      report(node);
    } else if (ts.isJsxAttribute(node) && isLabelName(node.name)) {
      const value =
        node.initializer && ts.isJsxExpression(node.initializer) ? node.initializer.expression : node.initializer;
      if (isText(value)) report(node);
    } else if (ts.isJsxElement(node) && /\bsr-only\b/.test(node.openingElement.attributes.getText())) {
      if (
        node.children.some(
          (child) =>
            (ts.isJsxText(child) && child.text.trim()) || (ts.isJsxExpression(child) && isText(child.expression)),
        )
      ) {
        report(node);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return problems;
}

test("components stay generic: no product code, framework router or copy", () => {
  for (const item of code) {
    for (const { path, text } of sources(item)) {
      for (const specifier of importsOf(text).filter((specifier) => specifier.startsWith("@/"))) {
        assert.match(specifier, /^@\/(lib\/utils|components\/ui\/)/, `${path}: ${specifier}`);
      }
      assert.ok(!importsOf(text).some((specifier) => specifier.startsWith("next/")), path);
      // Labels come in through props, in the project's language.
      assert.deepEqual(builtInLabels(path, text), []);
    }
  }
});

test("the label check sees defaults, fallbacks, literal attributes and screen-reader text", () => {
  const cases: [string, number][] = [
    ['function A({ closeLabel = "Close" }: P) {}', 1],
    ["function A(label = `Close`) {}", 1],
    ['const a = closeLabel ?? "Close";', 1],
    ['const a = props.label || "Close";', 1],
    ['const a = closeLabel ? closeLabel : "Close";', 1],
    ['const a = <button aria-label="Close" />;', 1],
    ['const a = <button aria-label={"Close"} />;', 1],
    ["const a = <Dialog closeLabel={`Close`} />;", 1],
    ['const a = <span className="sr-only">Close</span>;', 1],
    // Fine: the words come from props, and className strings or other defaults are not labels.
    ['function A({ closeLabel, size = "sm" }: P) { return <span className="sr-only">{closeLabel}</span>; }', 0],
    ['const a = <button aria-label={closeLabel} className="sr-only" />;', 0],
    ['const a = labelId ?? "x"; const b = showLabel ? 1 : 2;', 0],
  ];
  for (const [text, count] of cases) assert.equal(builtInLabels("x.tsx", text).length, count, text);
});

/** The directive prologue: the string statements before any code. Comments above them do not count. */
const directivesOf = (file: ts.SourceFile) => {
  const directives: string[] = [];
  for (const statement of file.statements) {
    if (!ts.isExpressionStatement(statement) || !ts.isStringLiteral(statement.expression)) break;
    directives.push(statement.expression.text);
  }
  return directives;
};

/** A component name: PascalCase with a lowercase letter, so a SCREAMING_CASE constant such as ROW_IGNORE is not one. */
const isComponentName = (name: string) => /^[A-Z][A-Za-z0-9]*$/.test(name) && /[a-z]/.test(name);

/** A function, or forwardRef/memo/lazy of one: what React can render. A cva() call, a string or a context is not. */
const isComponentValue = (node: ts.Node | undefined): boolean =>
  node !== undefined &&
  (ts.isFunctionDeclaration(node) ||
    ts.isArrowFunction(node) ||
    ts.isFunctionExpression(node) ||
    (ts.isCallExpression(node) && /^(React\.)?(forwardRef|memo|lazy)$/.test(node.expression.getText())));

/** The exports of a "use client" file that are not components, as messages; empty for a file without the directive. */
function nonComponentExports(path: string, text: string) {
  const file = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  if (!directivesOf(file).includes("use client")) return [];
  const local = new Map<string, ts.Node | undefined>();
  for (const statement of file.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) local.set(statement.name.text, statement);
    if (ts.isVariableStatement(statement)) {
      for (const { name, initializer } of statement.declarationList.declarations)
        if (ts.isIdentifier(name)) local.set(name.text, initializer);
    }
  }
  const problems: string[] = [];
  const check = (name: string, value: ts.Node | undefined) => {
    if (!isComponentName(name) || !isComponentValue(value)) problems.push(`${path} exports ${name}`);
  };
  for (const statement of file.statements) {
    if (ts.isExportDeclaration(statement)) {
      if (statement.isTypeOnly) continue;
      // A re-export cannot be checked here, and `export *` could carry anything.
      if (statement.moduleSpecifier || !statement.exportClause || !ts.isNamedExports(statement.exportClause)) {
        problems.push(`${path} re-exports ${statement.getText()}`);
        continue;
      }
      for (const element of statement.exportClause.elements) {
        if (!element.isTypeOnly) check(element.name.text, local.get((element.propertyName ?? element.name).getText()));
      }
    } else if (ts.isExportAssignment(statement)) {
      const value = ts.isIdentifier(statement.expression) ? local.get(statement.expression.text) : statement.expression;
      check(ts.isIdentifier(statement.expression) ? statement.expression.text : "default", value);
    } else if (
      ts.canHaveModifiers(statement) &&
      ts.getModifiers(statement)?.some(({ kind }) => kind === ts.SyntaxKind.ExportKeyword)
    ) {
      if (ts.isFunctionDeclaration(statement) && statement.name) check(statement.name.text, statement);
      else if (ts.isVariableStatement(statement)) {
        for (const { name, initializer } of statement.declarationList.declarations)
          check(ts.isIdentifier(name) ? name.text : name.getText(), initializer);
      } else if (!ts.isInterfaceDeclaration(statement) && !ts.isTypeAliasDeclaration(statement)) {
        problems.push(`${path} exports ${statement.getText().split("\n")[0]}`);
      }
    }
  }
  return problems;
}

test('a "use client" file exports components only', () => {
  // A Server Component gets every export of such a file as a client reference: a class string arrives as an object
  // that cn drops, and a helper cannot be called. Helpers go in a file without the directive.
  for (const item of code) {
    for (const { path, text } of sources(item)) assert.deepEqual(nonComponentExports(path, text), []);
  }
});

test('the "use client" export check sees constants, non-components and a directive under a comment', () => {
  const client = (body: string) => `// A note above the directive.\n"use client";\n${body}`;
  const cases: [string, string[]][] = [
    [client('export const ROW_IGNORE = "[data-row-ignore]";'), ["x.tsx exports ROW_IGNORE"]],
    [
      client("const TableVariants = { plain: 1 };\nfunction Table() {}\nexport { Table, TableVariants };"),
      ["x.tsx exports TableVariants"],
    ],
    [
      client("const ButtonContext = React.createContext(null);\nexport { ButtonContext };"),
      ["x.tsx exports ButtonContext"],
    ],
    [client("function rowClickHandler() {}\nexport { rowClickHandler };"), ["x.tsx exports rowClickHandler"]],
    [client('export * from "./table-row";'), ['x.tsx re-exports export * from "./table-row";']],
    [
      client(
        "const Toaster = () => null;\nfunction QRCode() {}\nexport type { Props } from './p';\nexport { Toaster, QRCode };",
      ),
      [],
    ],
    ['export const ROW_IGNORE = "[data-row-ignore]";', []],
  ];
  for (const [text, problems] of cases) assert.deepEqual(nonComponentExports("x.tsx", text), problems, text);
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

test("the ink shell carries the dark values and maps every semantic name again", () => {
  const declarations = (block: string) =>
    new Map([...block.matchAll(/(--[a-z0-9-]+): ([^;]+);/g)].map(([, name, value]) => [name!, value!]));
  const dark = declarations(theme.match(/:root\[data-theme="dark"\] \{([\s\S]*?)\n\}/)![1]!);
  const ink = declarations(theme.match(/\n\.ink \{([\s\S]*?)\n\}/)![1]!);
  // Its own surface is --ink, so bg and sidebar point there; control is a step stronger on purpose; a shadow falls on
  // the page, so it keeps the page's; charts are not for a shell.
  const own = new Set(["--bg", "--sidebar", "--control", "--ink", "--popover-shadow"]);
  for (const [name, value] of dark) {
    if (own.has(name) || name.startsWith("--chart-")) continue;
    assert.equal(ink.get(name), value, name);
  }
  assert.equal(ink.get("--bg"), "var(--ink)");
  // A semantic name left out would keep the page's value: light text colors on the ink in a light page.
  const semantic = declarations(theme.match(/mapped onto the tokens above\. \*\/\n:root \{([\s\S]*?)\n\}/)![1]!);
  for (const [name, value] of semantic) assert.equal(ink.get(name), value, name);
  for (const name of ["--card", "--sidebar-foreground", "--sidebar-border"]) assert.ok(ink.has(name), name);
});

test("a utility on the ink shell's own element overrides its fill and text color", async () => {
  const compiler = await compile(`${theme}\n@tailwind utilities;`, {
    base: process.cwd(),
    loadStylesheet: async () => ({ path: "", base: "", content: "" }),
  });
  const css = compiler.build(["text-muted-foreground"]);
  // Unlayered declarations beat every layer, so the shell's defaults have to sit in the base layer, below utilities.
  const unlayered = theme.match(/\n\.ink \{([\s\S]*?)\n\}/)![1]!;
  assert.doesNotMatch(unlayered, /^\s*(color|background-color|color-scheme):/m);
  const base = css.slice(css.indexOf("@layer base"), css.indexOf("@layer utilities"));
  assert.match(base, /\.ink \{[^}]*background-color: var\(--bg\);[^}]*color: var\(--text\);/);
});

test("phone inputs stay at 16px outside any layer", () => {
  const rule = theme.lastIndexOf('[data-slot="native-select"]');
  assert.ok(rule > theme.lastIndexOf("@layer base"));
  assert.ok(theme.slice(theme.lastIndexOf("}\n\n", rule)).startsWith("}\n\n"));
});
