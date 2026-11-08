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

/** Reads the object literal that starts at `start` (the index of its `{`) and returns its text and end index. */
function block(code: string, start: number) {
  let depth = 0;
  for (let index = start; index < code.length; index++) {
    const skipped = index > start ? skipStringOrComment(code, index) : index;
    if (skipped > index) {
      index = skipped - 1;
      continue;
    }
    const char = code[index];
    if (char === "{") depth++;
    else if (char === "}" && --depth === 0) return { text: code.slice(start + 1, index), end: index };
  }
  return { text: code.slice(start + 1), end: code.length };
}

/** The index just past the string or comment that starts at `index`, or `index` when none does. */
function skipStringOrComment(text: string, index: number) {
  const char = text[index];
  if (char === '"' || char === "'" || char === "`") {
    for (let end = index + 1; end < text.length; end++) {
      if (text[end] === "\\") end++;
      else if (text[end] === char) return end + 1;
    }
    return text.length;
  }
  if (text.startsWith("//", index)) return text.indexOf("\n", index) + 1 || text.length;
  if (text.startsWith("/*", index)) return text.indexOf("*/", index) + 2 || text.length;
  return index;
}

/** The keys of an object literal at depth one, with the text of each object value; strings and comments are skipped. */
function entries(text: string) {
  const found: { key: string; value: string }[] = [];
  let depth = 0;
  let index = 0;
  while (index < text.length) {
    const skipped = skipStringOrComment(text, index);
    if (skipped > index) {
      index = skipped;
      continue;
    }
    if (depth === 0) {
      const key = text.slice(index).match(/^\s*"?([A-Za-z0-9_-]+)"?:\s*/);
      if (key) {
        const start = index + key[0].length;
        if (text[start] === "{") {
          const value = block(text, start);
          found.push({ key: key[1]!, value: value.text });
          index = value.end + 1;
        } else {
          // A string, array or other value: the next round skips it as a string or counts its brackets.
          found.push({ key: key[1]!, value: "" });
          index = start;
        }
        continue;
      }
    }
    const char = text[index];
    if (char === "{" || char === "[") depth++;
    else if (char === "}" || char === "]") depth--;
    index++;
  }
  return found;
}

/**
 * The variant props of every cva() call in a source file, merged by name (status-label defines `tone` twice, once for
 * the label and once for the dot). A prop without cva, such as SelectTrigger's size, is not listed.
 */
export function variantsOf(code: string): VariantGroup[] {
  const groups = new Map<string, VariantGroup>();
  for (const call of code.matchAll(/\bcva\(/g)) {
    const variants = code.indexOf("variants:", call.index);
    if (variants === -1) break;
    const config = block(code, code.indexOf("{", variants));
    const defaults = code.indexOf("defaultVariants:", config.end);
    const chosen = new Map(
      defaults === -1
        ? []
        : [...block(code, code.indexOf("{", defaults)).text.matchAll(/([A-Za-z0-9_-]+):\s*"([^"]+)"/g)].map(
            ([, name, option]) => [name!, option!],
          ),
    );
    for (const { key, value } of entries(config.text)) {
      const options = entries(value).map(({ key: option }) => option);
      if (options.length === 0) continue;
      const group = groups.get(key) ?? { name: key, options: [] };
      for (const option of options) if (!group.options.includes(option)) group.options.push(option);
      const chosenOption = chosen.get(key);
      if (chosenOption) group.defaultOption = chosenOption;
      groups.set(key, group);
    }
  }
  return [...groups.values()];
}
