"use client";

import { ThemePicker, type ThemePreference } from "@/components/ui/theme-picker";
import { useThemePreference } from "@/components/ui/use-theme-preference";

export const defaultCopy = {
  system: "System",
  light: "Light",
  dark: "Dark",
  themeLabel: "Theme: {theme}",
  theme: "Theme",
  notKnownYet: "Not known yet",
};

/* This site renders <ThemeScript /> in its <head>, so this picker and the one in the header change the same theme. */
export default function ThemeScriptDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const labels: Record<ThemePreference, string> = { system: copy.system, light: copy.light, dark: copy.dark };
  const [preference, setPreference] = useThemePreference();
  return (
    <div className="flex items-center gap-3">
      <ThemePicker
        value={preference}
        onValueChange={setPreference}
        labels={labels}
        label={copy.themeLabel.replace("{theme}", labels[preference ?? "system"])}
      />
      <span className="text-sm text-muted-foreground">{preference ? labels[preference] : copy.notKnownYet}</span>
    </div>
  );
}
