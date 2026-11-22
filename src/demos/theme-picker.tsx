"use client";

import { useState } from "react";
import { ThemePicker, type ThemePreference } from "@/components/ui/theme-picker";

export const defaultCopy = { system: "System", light: "Light", dark: "Dark", themeLabel: "Theme: {theme}" };

/* The page holds the preference (here in state; a project keeps it with theme-script, next-themes or a cookie). */
export default function ThemePickerDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const labels = { system: copy.system, light: copy.light, dark: copy.dark };
  const [preference, setPreference] = useState<ThemePreference>("system");
  return (
    <div className="flex items-center gap-3">
      <ThemePicker
        value={preference}
        onValueChange={setPreference}
        labels={labels}
        label={copy.themeLabel.replace("{theme}", labels[preference])}
      />
      <span className="text-sm text-muted-foreground">{labels[preference]}</span>
    </div>
  );
}
