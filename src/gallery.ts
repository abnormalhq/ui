import { readFile } from "node:fs/promises";
import postcss from "postcss";

export const featured = ["button", "badge", "switch"] as const;

export function galleryTokensFromCss(css: string) {
  const root = postcss.parse(css);
  const light = new Map<string, string>();
  const overrides = new Map<string, string>();
  let theme: (typeof root.nodes)[number] | undefined;
  // The type scale sits in a plain @theme (so a density can change it) and the colors in @theme inline: read both.
  const themes: (typeof root.nodes)[number][] = [];

  for (const node of root.nodes) {
    // The derived mixes are declared on ":root, .ink" together, so a selector list that names :root counts as :root.
    const selectors = node.type === "rule" ? node.selectors.map((selector) => selector.trim()) : [];
    if (node.type === "rule" && (selectors.includes(":root") || node.selector === ':root[data-theme="dark"]')) {
      const values = selectors.includes(":root") ? light : overrides;
      for (const child of node.nodes ?? []) {
        if (child.type === "decl") values.set(child.prop, child.value.trim());
      }
    } else if (node.type === "atrule" && node.name === "theme") {
      themes.push(node);
      if (!theme && node.params.trim() === "inline") theme = node;
    }
  }

  const dark = new Map([...light, ...overrides]);
  if (!theme || theme.type !== "atrule") throw new Error("Missing @theme inline block");
  const declarations = themes.flatMap((block) =>
    block.type === "atrule" ? (block.nodes ?? []).filter((node) => node.type === "decl") : [],
  );

  function resolve(name: string, values: Map<string, string>) {
    const seen = new Set<string>();
    while (!seen.has(name)) {
      seen.add(name);
      const value = values.get(name);
      if (!value) break;
      const alias = value.match(/^var\((--[\w-]+)\)$/);
      if (!alias) return value;
      name = alias[1]!;
    }
    throw new Error(`Unresolved gallery color: ${name}`);
  }

  const colors = declarations.flatMap((declaration) => {
    const name = declaration.prop.match(/^--color-([\w-]+)$/)?.[1];
    const token = declaration.value.trim().match(/^var\((--[\w-]+)\)$/)?.[1];
    return name && token
      ? [{ name, reference: `var(${token})`, light: resolve(token, light), dark: resolve(token, dark) }]
      : [];
  });

  const lineHeights = new Map<string, string>();
  for (const declaration of declarations) {
    const name = declaration.prop.match(/^--text-([\w-]+)--line-height$/)?.[1];
    if (name) lineHeights.set(name, declaration.value.trim());
  }
  const sizes = declarations.flatMap((declaration) => {
    const name = declaration.prop.match(/^--text-([\w-]+)$/)?.[1];
    const leading = name ? lineHeights.get(name) : undefined;
    return name && leading !== undefined ? [{ name: `text-${name}`, size: declaration.value.trim(), leading }] : [];
  });

  return { colors, sizes };
}

/** Read the registry stylesheet at export time, including the aliases that share a palette color. */
export async function galleryTokens() {
  return galleryTokensFromCss(await readFile("registry/styles/abnormal.css", "utf8"));
}
