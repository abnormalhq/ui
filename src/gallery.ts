import { readFile } from "node:fs/promises";

export const featured = ["button", "badge", "switch"] as const;

/** Read the registry stylesheet at export time, including the aliases that share a palette color. */
export async function galleryTokens() {
  const css = (await readFile("registry/styles/abnormal.css", "utf8")).replace(/\/\*[\s\S]*?\*\//g, "");
  const light = new Map<string, string>();
  const overrides = new Map<string, string>();
  for (const [, selector, block] of css.matchAll(/^(:(?:root|root\[data-theme="dark"\]))\s*\{([^}]+)\}/gm)) {
    const values = selector === ":root" ? light : overrides;
    for (const [, key, value] of block!.matchAll(/(--[\w-]+):\s*([^;]+);/g)) values.set(key!, value!.trim());
  }
  const dark = new Map([...light, ...overrides]);
  const theme = css.match(/@theme inline\s*\{([\s\S]*?)^\}/m)![1]!;

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

  const colors = Array.from(theme.matchAll(/--color-([\w-]+):\s*var\((--[\w-]+)\);/g), ([, name, token]) => ({
    name: name!,
    reference: `var(${token})`,
    light: resolve(token!, light),
    dark: resolve(token!, dark),
  }));
  const sizes = Array.from(
    theme.matchAll(/--text-([\w-]+):\s*([^;]+);\s*--text-\1--line-height:\s*([^;]+);/g),
    ([, name, size, leading]) => ({ name: `text-${name}`, size: size!, leading: leading! }),
  );
  return { colors, sizes };
}
