"use client";

import * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react";

type Theme = "light" | "dark";

/** The theme the page shows, by the rule abnormal.css paints with: data-theme on <html>, else the system preference. */
function currentTheme(): Theme {
  const forced = document.documentElement.dataset.theme;
  if (forced === "light" || forced === "dark") return forced;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Wakes on a data-theme change (whatever script writes it) and on a system preference change. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

/**
 * Toasts sit on a popover surface; success and failure speak only through the icon color, without tinting the whole block.
 * The toaster reads the theme from <html data-theme> and the system preference, the same rule as the tokens, so it
 * needs no theme library: next-themes, a hand-written script or nothing at all give the same result.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  // The server does not know the theme; the first client render corrects it before any toast can show.
  const theme = React.useSyncExternalStore(subscribe, currentTheme, () => "light" as Theme);

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-success" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover-bg)",
          "--normal-text": "var(--text)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-panel)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
