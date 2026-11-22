"use client";

import { useState } from "react";
import { LanguagePicker } from "@/components/ui/language-picker";

export const defaultCopy = {
  followBrowser: "Follow the browser",
  english: "English",
  chinese: "中文",
  languageLabel: "Language: {value}",
  language: "Language",
};

const options = [
  { value: "auto", labelKey: "followBrowser" },
  { value: "en", labelKey: "english", lang: "en" },
  { value: "zh", labelKey: "chinese", lang: "zh-CN" },
] as const;

/* The page holds the choice (a cookie, a saved preference) and writes it back. */
export default function LanguagePickerDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [locale, setLocale] = useState("en");
  const localizedOptions = options.map(({ labelKey, ...option }) => ({ ...option, label: copy[labelKey] }));
  const current = localizedOptions.find((option) => option.value === locale)!;
  return (
    <div className="flex items-center gap-3">
      <LanguagePicker
        options={localizedOptions}
        value={locale}
        onValueChange={setLocale}
        label={copy.languageLabel.replace("{value}", current.label)}
        tooltip={copy.language}
      />
      <LanguagePicker
        options={localizedOptions}
        value={locale}
        onValueChange={setLocale}
        label={copy.languageLabel.replace("{value}", current.label)}
        showValue
        variant="outline"
      />
    </div>
  );
}
