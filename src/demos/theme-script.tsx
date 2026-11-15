"use client";

import { ThemePicker, type ThemePreference } from "@/components/ui/theme-picker";
import { useThemePreference } from "@/components/ui/use-theme-preference";

const labels: Record<ThemePreference, string> = { system: "System", light: "Light", dark: "Dark" };

/* This site renders <ThemeScript /> in its <head>, so this picker and the one in the header change the same theme. */
export default function ThemeScriptDemo() {
  const [preference, setPreference] = useThemePreference();
  return (
    <div className="flex items-center gap-3">
      <ThemePicker
        value={preference}
        onValueChange={setPreference}
        labels={labels}
        label={`Theme: ${labels[preference ?? "system"]}`}
      />
      <span className="text-sm text-muted-foreground">{preference ? labels[preference] : "Not known yet"}</span>
    </div>
  );
}
