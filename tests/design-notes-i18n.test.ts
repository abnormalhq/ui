import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { designNotes } from "../src/notes.ts";
import { localizedDesignNotes } from "../src/i18n/design-notes.ts";

test("Chinese design notes cover every source note, with no stale entries or English fallback", () => {
  const { items } = JSON.parse(readFileSync("registry.json", "utf8")) as {
    items: { name: string; files: { path: string }[] }[];
  };
  const copy = JSON.parse(readFileSync("src/i18n/registry-copy/notes.zh-CN.json", "utf8")) as Record<
    string,
    Record<string, string>
  >;
  const names: string[] = [];
  for (const item of items) {
    const notes = item.files
      .filter(({ path }) => /\.tsx?$/.test(path))
      .flatMap(({ path }) => designNotes(readFileSync(path, "utf8")));
    assert.deepEqual(localizedDesignNotes("en", item.name, notes), notes);
    if (!notes.length) continue;
    names.push(item.name);
    const itemCopy = copy[item.name];
    assert.ok(itemCopy, item.name);
    assert.deepEqual(Object.keys(itemCopy).sort(), [...new Set(notes)].sort(), item.name);
    const localized = localizedDesignNotes("zh-CN", item.name, notes);
    assert.equal(localized.length, notes.length);
    for (const [index, text] of localized.entries()) {
      assert.match(text, /[\u3400-\u9fff]/, `${item.name}: ${index}`);
      assert.notEqual(text, notes[index]);
    }
  }
  assert.deepEqual(Object.keys(copy).sort(), names.sort());
});

test("a changed or new Chinese source note fails instead of silently showing English", () => {
  assert.throws(() => localizedDesignNotes("zh-CN", "button", ["A new source note"]), /Missing Chinese design note/);
});
