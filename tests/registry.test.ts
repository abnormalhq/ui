import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { test } from "node:test";
import { compile } from "tailwindcss";
import { cn } from "../registry/lib/utils.ts";
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

/** Packages whose modules carry "use client": lucide-react 1.x marks its Icon, which every icon renders through. */
const clientPackages = new Set(["lucide-react"]);

/**
 * The modules a file loads at run time: static imports, re-exports and import("x"), without `import type` and
 * `export type ... from`, which compile to nothing. An inline `import { type X }` still loads its module: it compiles
 * to `import {} from "x"` under verbatimModuleSyntax.
 */
function runtimeImportsOf(path: string, text: string) {
  const file = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const specifiers: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const typeOnly = ts.isImportDeclaration(node) ? node.importClause?.isTypeOnly : node.isTypeOnly;
      if (!typeOnly && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        specifiers.push(node.moduleSpecifier.text);
      }
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return specifiers;
}

const isClientModule = (path: string, text: string) =>
  directivesOf(ts.createSourceFile(path, text, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX)).includes(
    "use client",
  );

/**
 * The first client import a module without "use client" reaches, directly or through other registry modules without
 * it, as the chain of module names ending in the package or the client module; undefined when there is none.
 */
function clientImportOf(modules: Map<string, { path: string; text: string }>, start: string) {
  const seen = new Set<string>();
  const walk = (name: string): string[] | undefined => {
    const file = modules.get(name);
    if (!file || seen.has(name)) return undefined;
    seen.add(name);
    for (const specifier of runtimeImportsOf(file.path, file.text)) {
      if (clientPackages.has(packageOf(specifier))) return [name, packageOf(specifier)];
      const component = specifier.match(/^@\/components\/ui\/([a-z-]+)$/)?.[1];
      const target = component && modules.get(component);
      if (!component || !target) continue;
      if (isClientModule(target.path, target.text)) return [name, component];
      const chain = walk(component);
      if (chain) return [name, ...chain];
    }
    return undefined;
  };
  const first = modules.get(start);
  return first && !isClientModule(first.path, first.text) ? walk(start) : undefined;
}

test('an item without "use client" imports no client module, so a page using it ships no client JavaScript', () => {
  // A Server Component that imports a client module, even one that only draws an icon, makes the page load a client
  // chunk for it. Icons in such an item are drawn inline, with lucide's paths, size and stroke.
  const modules = new Map(
    code.flatMap((item) => sources(item).map(({ path, text }) => [moduleName(path), { path, text }])),
  );
  const problems = [...modules.keys()].flatMap((name) => {
    const chain = clientImportOf(modules, name);
    return chain ? [chain.join(" -> ")] : [];
  });
  assert.deepEqual(problems, []);
});

test("the client import check follows registry modules and stops at a client boundary", () => {
  const modules = new Map(
    Object.entries({
      icon: 'import { PlusIcon } from "lucide-react";',
      card: 'import { Icon } from "@/components/ui/icon";',
      menu: '"use client";\nimport { CheckIcon } from "lucide-react";',
      header: 'import { Menu } from "@/components/ui/menu";',
      deep: 'import { Card } from "@/components/ui/card";',
      plain: 'import { Slot } from "radix-ui";\nimport { cn } from "@/lib/utils";',
      typed: 'import type { LucideIcon } from "lucide-react";\nexport type { MenuProps } from "@/components/ui/menu";',
      inline: 'import { type LucideIcon } from "lucide-react";',
      lazy: 'const Menu = React.lazy(() => import("@/components/ui/menu"));',
    }).map(([name, text]) => [name, { path: `${name}.tsx`, text }]),
  );
  const chains = Object.fromEntries([...modules.keys()].map((name) => [name, clientImportOf(modules, name)]));
  assert.deepEqual(chains, {
    icon: ["icon", "lucide-react"],
    card: ["card", "icon", "lucide-react"],
    menu: undefined,
    header: ["header", "menu"],
    deep: ["deep", "card", "icon", "lucide-react"],
    plain: undefined,
    typed: undefined,
    inline: ["inline", "lucide-react"],
    lazy: ["lazy", "menu"],
  });
});

test("cn knows every custom token in the theme", () => {
  const utils = read("registry/lib/utils.ts");
  const listed = (key: string, separator = ":") =>
    [...utils.match(new RegExp(`${key}${separator} \\[([^\\]]*)\\]`))![1]!.matchAll(/"([^"]+)"/g)].map((m) => m[1]!);
  const tokens = (prefix: string) => [...theme.matchAll(new RegExp(`--${prefix}-([a-z-]+):`, "g"))].map((m) => m[1]!);
  assert.deepEqual(listed("radius").toSorted(), tokens("radius").toSorted());
  assert.deepEqual(listed("shadow").toSorted(), tokens("shadow").toSorted());
  assert.deepEqual(listed("animate").toSorted(), tokens("animate").toSorted());
  assert.deepEqual(listed("tracking").toSorted(), tokens("tracking").toSorted());
  assert.deepEqual(listed("CN_LAYERS", " =").toSorted(), tokens("z-index").toSorted());
  assert.equal(cn("z-overlay", "z-40"), "z-40");
  assert.equal(cn("z-50", "z-floating"), "z-floating");
  assert.equal(cn("tracking-heading", "tracking-tight"), "tracking-tight");
  // The built-in size names (xs to 4xl, and the theme's 2xs and md) are sizes to cn already; the display names are not.
  const display = tokens("text").filter((name) => name.startsWith("display") && !name.endsWith("-line-height"));
  assert.deepEqual(listed("text").toSorted(), display.toSorted());
  assert.equal(cn("text-display", "text-foreground"), "text-display text-foreground");
  assert.equal(cn("text-3xl", "text-display-lg"), "text-display-lg");
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

test("the type scale is variable-based, and the compact density tightens spacing and interface type only", async () => {
  const compiler = await compile(`${theme}\n@tailwind utilities;`, {
    base: process.cwd(),
    loadStylesheet: async () => ({ path: "", base: "", content: "" }),
  });
  const css = compiler.build(["text-sm", "text-display"]);
  // A density can only change sizes the utilities read as variables.
  assert.match(
    css,
    /\.text-sm \{\s*font-size: var\(--text-sm\);\s*line-height: var\(--tw-leading, var\(--text-sm--line-height\)\);/,
  );
  assert.match(css, /\.text-display \{\s*font-size: var\(--text-display\);/);
  const block = (selector: string) => theme.match(new RegExp(`\\n {2}${selector} \\{([\\s\\S]*?)\\n {2}\\}`))![1]!;
  const compact = Object.fromEntries(
    [...block('\\[data-ui-density="compact"\\]').matchAll(/(--[a-z0-9-]+): ([^;]+);/g)].map(([, name, value]) => [
      name!,
      value!,
    ]),
  );
  assert.equal(compact["--spacing"], "3.5px");
  assert.equal(compact["--text-base"], "13px");
  assert.equal(compact["--leading-body"], "1.45");
  // 2xs is the floor for meta text and the display scale is for marketing lines: neither shrinks.
  assert.ok(!Object.keys(compact).some((name) => name.startsWith("--text-2xs") || name.startsWith("--text-display")));
  // Every interface size it changes is smaller than the default it replaces.
  for (const [name, value] of Object.entries(compact)) {
    if (!/^--text-[a-z0-9]+$/.test(name)) continue;
    const base = theme.match(new RegExp(`\\n  ${name}: (\\d+)px;`))![1]!;
    assert.ok(Number.parseFloat(value) < Number(base), `${name} ${value} is not below ${base}px`);
  }
  // The smallest targets keep the 24px WCAG minimum when the spacing step shrinks.
  const button = readFileSync("registry/ui/button.tsx", "utf8");
  assert.match(button, /xs: "h-6 min-h-\[24px\]/);
  assert.match(button, /"icon-xs": "size-6 min-h-\[24px\] min-w-\[24px\]/);
  const searchInput = readFileSync("registry/ui/search-input.tsx", "utf8");
  // The small box's end padding (pr-8) must hold the 24px button and its right-1 inset at either spacing step.
  assert.match(searchInput, /sm: \{ input: "pr-8 [^"]*", icon: "[^"]*", clear: "size-5 min-h-\[24px\] min-w-\[24px\]/);
  assert.match(searchInput, /clear: "size-6 min-h-\[24px\] min-w-\[24px\]/);
  assert.match(readFileSync("registry/ui/info-hint.tsx", "utf8"), /size-6 min-h-\[24px\] min-w-\[24px\]/);
  // Table and ItemList write data-density on their own element; the page's density must not match it.
  assert.doesNotMatch(theme, /\[data-density/);
  // Only for a mouse or trackpad: touch screens keep full-size targets.
  const media = theme.slice(0, theme.indexOf('[data-ui-density="compact"] {'));
  assert.ok(media.trimEnd().endsWith("@media (pointer: fine) {"));
  // A dense region below <html> sets its own text size; <html> keeps the rem. The default is in the base layer, so a
  // text-* or leading-* utility on the region's own element (Prose's text-md/[1.9]) still wins.
  const region = theme.indexOf('[data-ui-density="compact"]:not(:root) {');
  assert.ok(theme.slice(0, region).trimEnd().endsWith("@layer base {\n  @media (pointer: fine) {"));
  assert.match(theme.slice(region), /^[^}]*font-size: var\(--text-base\);\s*line-height: var\(--leading-body\);/);
  assert.match(theme, /body \{[^}]*font-size: var\(--text-base\);\s*line-height: var\(--leading-body\);/);
  // Compiled the way a product does, the region default lands in the base layer and the region's own utility in the
  // utilities layer, which the declared order puts last, so the utility wins.
  const layered = await compile(
    `@layer theme, base, components, utilities;\n${theme}\n@layer utilities { @tailwind utilities; }`,
    { base: process.cwd(), loadStylesheet: async () => ({ path: "", base: "", content: "" }) },
  );
  const built = layered.build(["text-md/[1.9]"]);
  // The innermost open @layer block at the rule, following every brace, so a rule after a layer closes reads as unlayered.
  const layerOf = (needle: string) => {
    const at = built.indexOf(needle);
    assert.ok(at >= 0, needle);
    const open: string[] = [];
    let start = 0;
    for (const match of built.slice(0, at).matchAll(/[{}]/g)) {
      if (match[0] === "{") {
        open.push(built.slice(start, match.index).trim());
      } else {
        open.pop();
      }
      start = match.index + 1;
    }
    return open
      .map((header) => header.match(/@layer ([a-z]+)$/)?.[1])
      .filter(Boolean)
      .at(-1);
  };
  assert.match(built, /@layer theme, base, components, utilities;/);
  assert.equal(layerOf('[data-ui-density="compact"]:not(:root) {'), "base");
  assert.equal(layerOf(".text-md\\/\\[1\\.9\\] {"), "utilities");
});

test("the ink shell carries the dark values and maps every semantic name again", () => {
  const declarations = (block: string) =>
    new Map([...block.matchAll(/(--[a-z0-9-]+): ([^;]+);/g)].map(([, name, value]) => [name!, value!]));
  const dark = declarations(theme.match(/:root\[data-theme="dark"\] \{([\s\S]*?)\n\}/)![1]!);
  const ink = declarations(theme.match(/\n\.ink \{([\s\S]*?)\n\}/)![1]!);
  // Its own surface is --ink, so bg, sidebar and canvas point there; control and selected are a step stronger on
  // purpose, and the current item takes selected, since the shell's paper is its canvas; a shadow falls on the page,
  // so it keeps the page's; charts are not for a shell, and neither is the overlay, which dims the page behind a
  // dialog portaled to <body>.
  const own = new Set([
    "--bg",
    "--sidebar",
    "--canvas",
    "--control",
    "--selected",
    "--sidebar-accent",
    "--ink",
    "--popover-shadow",
    "--overlay",
  ]);
  for (const [name, value] of dark) {
    if (own.has(name) || name.startsWith("--chart-")) continue;
    assert.equal(ink.get(name), value, name);
  }
  assert.equal(ink.get("--bg"), "var(--ink)");
  // A semantic name left out would keep the page's value: light text colors on the ink in a light page.
  const semantic = declarations(theme.match(/mapped onto the tokens above\. \*\/\n:root \{([\s\S]*?)\n\}/)![1]!);
  for (const [name, value] of semantic) assert.equal(ink.get(name), value, name);
  for (const name of ["--card", "--sidebar-foreground", "--sidebar-border", "--sidebar-accent"])
    assert.ok(ink.has(name), name);
});

test("a Marker inside the ink shell takes the soft band, as it does in dark mode", async () => {
  // Text in the shell is light in both themes and dark: does not apply there, so the band has its own rule for it.
  const source = read("registry/brand/marker.tsx");
  const classes = source.match(/"(bg-\[linear-gradient[^"]+)"/)![1]!.split(" ");
  const compiler = await compile(`${theme}\n@tailwind utilities;`, {
    base: process.cwd(),
    loadStylesheet: async () => ({ path: "", base: "", content: "" }),
  });
  const css = compiler.build(classes);
  assert.match(css, /\.ink \.\S+ \{\s*--marker-band: var\(--highlight-muted\);/);
  assert.match(css, /--marker-band: var\(--highlight\);/);
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

test("prose frames a bare <pre> from Markdown, and leaves a CodeBlock's own pre to it", async () => {
  const compiler = await compile(`${theme}\n@tailwind utilities;`, {
    base: process.cwd(),
    loadStylesheet: async () => ({ path: "", base: "", content: "" }),
  });
  const source = read("registry/marketing/prose.tsx");
  const classes = [...source.matchAll(/"([^"]*\[&_[^"]*)"/g)].flatMap(([, list]) => list!.split(" "));
  const css = compiler.build(classes);
  // Every rule on a pre skips the one CodeBlock renders.
  const pre = [...css.matchAll(/^\s*([^{}\n]*\bpre\b[^{}\n]*)\{/gm)].map(([, selector]) => selector!.trim());
  assert.ok(pre.length > 0, css);
  // The rules on a pre itself, not on the code inside one or on inline code.
  for (const selector of pre.filter((selector) => !/code/.test(selector))) {
    assert.match(selector, /pre:not\(\[data-slot=code-block-pre\]\)/, selector);
  }
  assert.match(css, /pre:not\(\[data-slot=code-block-pre\]\) \{\s*border-style/);
  // The spacing utilities need Tailwind's own theme, which this compile leaves out: the source says it instead.
  assert.ok(classes.includes("[&_pre:not([data-slot=code-block-pre])]:my-5"));
  assert.ok(classes.includes("[&_pre:not([data-slot=code-block-pre])]:p-4"));
  assert.ok(classes.includes("[&_[data-slot=code-block]]:my-5"), "the block still takes the spacing a framed pre has");
  assert.ok(!classes.some((name) => /^\[&_pre\]:/.test(name)), "no rule on every pre");
  assert.match(read("registry/ui/code-block.tsx"), /data-slot="code-block-pre"/);
});

test("the selectors the list, code and page components lean on compile to what they mean", async () => {
  const compiler = await compile(`${theme}\n@tailwind utilities;`, {
    base: process.cwd(),
    loadStylesheet: async () => ({ path: "", base: "", content: "" }),
  });
  const css = compiler.build([
    "not-has-[[role=option]]:hidden",
    "data-current:bg-selected",
    "group-has-[[aria-invalid=true]]/otp:border-destructive",
    "animate-expand",
    "animate-collapse",
  ]);
  // Command hides a listbox, and a group, that holds no option.
  assert.match(read("registry/ui/command.tsx"), /not-has-\[\[role=option\]\]:hidden/);
  assert.match(css, /:not\(:has\(:is\(\[role=option\]\)\)\) \{\s*display: none;/);
  // The current page of a Pagination, by the presence of the attribute.
  assert.match(css, /\[data-current\] \{\s*background-color: var\(--selected\);/);
  // An invalid InputOTP reddens its boxes, which are siblings of the field, through the group.
  assert.match(
    css,
    /:where\(\.group\\\/otp\):has\(:is\(\[aria-invalid=true\]\)\) [^{]+\{\s*border-color: var\(--destructive\);/,
  );
  // A panel opens to the height Radix measured; an accordion's panel carries the same variable.
  for (const name of ["expand", "collapse"]) {
    assert.match(css, new RegExp(`\\.animate-${name} \\{\\s*animation: ${name} `));
    const frames = theme.slice(theme.indexOf(`@keyframes ${name} {`)).split("@keyframes")[1]!;
    assert.match(frames, /height: var\(--radix-collapsible-content-height\)/);
    assert.match(frames, /height: 0/);
  }
});

test("reduced motion keeps an indeterminate progress bar alive, without a sweep", () => {
  const start = theme.indexOf("@media (prefers-reduced-motion: reduce)");
  const reduced = theme.slice(start, theme.indexOf("\n  }\n", start));
  // Left out of the rule that stops every animation, or the bar freezes as a third-width one that reads as 33%.
  assert.match(reduced, /\*:not\([^)]*\.animate-progress-sweep[^)]*\)/);
  const rule = reduced.match(/\n\s*\.animate-progress-sweep \{([^}]+)\}/)?.[1] ?? "";
  assert.match(rule, /width: 100% !important;/);
  const animation = rule.match(/animation: (\S+) [^;]*infinite[^;]* !important;/)?.[1];
  assert.ok(animation && animation !== "progress-sweep", "an animation of its own");
  // That animation moves nothing: opacity only.
  const frames = reduced.slice(reduced.indexOf(`@keyframes ${animation}`));
  assert.match(frames, /opacity/);
  assert.doesNotMatch(frames, /transform|translate/);
});

test("phone inputs stay at 16px outside any layer", () => {
  const rule = theme.lastIndexOf('[data-slot="native-select"]');
  assert.ok(rule > theme.lastIndexOf("@layer base"));
  assert.ok(theme.slice(theme.lastIndexOf("}\n\n", rule)).startsWith("}\n\n"));
});

test("figures are proportional by default, so Inter's hyphens and dashes keep their width", () => {
  const body = theme.match(/\n {2}body \{([\s\S]*?)\n {2}\}/)![1]!;
  assert.doesNotMatch(body, /tabular-nums/);
});

test("the semantic names for warning, overlays, strong borders, categories, tracking and stacking compile", async () => {
  const compiler = await compile(`${theme}\n@tailwind utilities;`, {
    base: process.cwd(),
    loadStylesheet: async () => ({ path: "", base: "", content: "" }),
  });
  const css = compiler.build([
    "text-warning",
    "bg-overlay",
    "border-border-strong",
    "hover:border-input-hover",
    "bg-category-teal-soft",
    "text-category-teal-ink",
    "tracking-heading",
    "tracking-caps",
    "z-overlay",
    "z-skip-link",
  ]);
  assert.match(css, /\.text-warning \{\s*color: var\(--color-warning\)|\.text-warning \{\s*color: var\(--warning\)/);
  assert.match(css, /\.bg-overlay \{\s*background-color: var\(--overlay\)/);
  assert.match(css, /\.bg-category-teal-soft \{\s*background-color: var\(--category-teal-soft\)/);
  assert.match(css, /\.tracking-heading \{[^}]*letter-spacing: var\(--tracking-heading\)/);
  assert.match(css, /\.z-overlay \{\s*z-index: var\(--z-index-overlay\)/);
  assert.match(css, /\.z-skip-link \{\s*z-index: var\(--z-index-skip-link\)/);
  // badge-ink stays as an alias of warning, also inside the ink shell, where a :root alias would keep the light value.
  assert.match(theme, /:root \{[^}]*--badge-ink: var\(--warning\);/);
  assert.match(theme, /\n\.ink \{[^}]*--badge-ink: var\(--warning\);/);
});
