"use client";

import { useState } from "react";
import { LanguagePicker } from "@/components/ui/language-picker";

const options = [
  { value: "auto", label: "Follow the browser" },
  { value: "en", label: "English", lang: "en" },
  { value: "zh", label: "中文", lang: "zh-CN" },
];

/* The page holds the choice (a cookie, a saved preference) and writes it back. */
export default function LanguagePickerDemo() {
  const [locale, setLocale] = useState("en");
  const current = options.find((option) => option.value === locale)!;
  return (
    <div className="flex items-center gap-3">
      <LanguagePicker
        options={options}
        value={locale}
        onValueChange={setLocale}
        label={`Language: ${current.label}`}
        tooltip="Language"
      />
      <LanguagePicker
        options={options}
        value={locale}
        onValueChange={setLocale}
        label={`Language: ${current.label}`}
        showValue
        variant="outline"
      />
    </div>
  );
}
