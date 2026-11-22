import translations from "./registry-copy/notes.zh-CN.json" with { type: "json" };
import type { Locale } from "./locales";

/** Source text is the key so editing or adding a note requires an explicit translation update. */
export function localizedDesignNotes(locale: Locale, item: string, notes: string[]): string[] {
  if (locale === "en") return notes;
  const copy = (translations as Record<string, Record<string, string>>)[item];
  return notes.map((note) => {
    const translated = copy?.[note];
    if (!translated) throw new Error(`Missing Chinese design note for ${item}: ${note}`);
    return translated;
  });
}
