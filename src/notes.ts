import ts from "typescript";

/**
 * The design notes of an item: the block comments at the top level of its source. They hold the reasoning behind
 * each component ("quiet urgency", why hover is opaque, why a sheet does not focus its first button), which the
 * one-line description cannot, so the page and the Markdown show them above the code.
 */
export function designNotes(code: string): string[] {
  const notes: string[] = [];
  // Block comments that start at column 0: the file's own and each component's, but not one inside a class list.
  for (const [, body] of code.matchAll(/^\/\*\*?\n?([\s\S]*?)\*\//gm)) {
    const text = body!
      .split("\n")
      .map((line) => line.replace(/^\s*\* ?/, "").trimEnd())
      .join("\n")
      .trim()
      .replace(/\n(?!\n)/g, " ")
      .replace(/ {2,}/g, " ");
    if (text) notes.push(text);
  }
  return notes;
}

/** One variant prop of a cva() call: its name, its options, and the one chosen when the prop is left out. */
export type VariantGroup = { name: string; options: string[]; defaultOption?: string };

function propertyKey(name: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
  if (ts.isNumericLiteral(name)) return String(Number(name.text.replaceAll("_", "")));
  return undefined;
}

function literalString(node: ts.Expression): string | undefined {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return undefined;
}

/**
 * The variant props of every cva() call in a source file, merged by name (status-label defines `tone` twice, once for
 * the label and once for the dot). A prop without cva, such as SelectTrigger's size, is not listed.
 */
export function variantsOf(code: string): VariantGroup[] {
  const groups = new Map<string, VariantGroup>();

  const source = ts.createSourceFile("variants.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  function readCall(call: ts.CallExpression) {
    const config = call.arguments[1];
    if (!config || !ts.isObjectLiteralExpression(config)) return;

    const defaults = new Map<string, string>();
    for (const property of config.properties) {
      if (
        !ts.isPropertyAssignment(property) ||
        propertyKey(property.name) !== "defaultVariants" ||
        !ts.isObjectLiteralExpression(property.initializer)
      ) {
        continue;
      }
      for (const variant of property.initializer.properties) {
        if (!ts.isPropertyAssignment(variant)) continue;
        const name = propertyKey(variant.name);
        const value = literalString(variant.initializer);
        if (name !== undefined && value !== undefined) defaults.set(name, value);
      }
    }

    for (const property of config.properties) {
      if (
        !ts.isPropertyAssignment(property) ||
        propertyKey(property.name) !== "variants" ||
        !ts.isObjectLiteralExpression(property.initializer)
      ) {
        continue;
      }
      for (const variant of property.initializer.properties) {
        if (!ts.isPropertyAssignment(variant) || !ts.isObjectLiteralExpression(variant.initializer)) continue;
        const name = propertyKey(variant.name);
        if (name === undefined) continue;
        const options = variant.initializer.properties
          .flatMap((option) => (ts.isPropertyAssignment(option) ? [propertyKey(option.name)] : []))
          .filter((option): option is string => option !== undefined);
        if (options.length === 0) continue;

        const group = groups.get(name) ?? { name, options: [] };
        for (const option of options) {
          if (!group.options.includes(option)) group.options.push(option);
        }
        const chosenOption = defaults.get(name);
        if (chosenOption !== undefined) group.defaultOption = chosenOption;
        groups.set(name, group);
      }
    }
  }

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "cva") {
      readCall(node);
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  return [...groups.values()];
}
