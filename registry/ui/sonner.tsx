"use client";

import * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

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
 * A page's own `className`, `style`, `icons` and `toastOptions` add to the toaster's instead of replacing them: its
 * classes join the toaster's, its icons and toast options replace only the ones it names, and the class names of
 * each part of a toast join the toaster's, so the toast keeps its look.
 */
const Toaster = ({ className, style, icons, toastOptions, ...props }: ToasterProps) => {
  // The server does not know the theme; the first client render corrects it before any toast can show.
  const theme = React.useSyncExternalStore<Theme>(subscribe, currentTheme, () => "light");

  return (
    <Sonner
      theme={theme}
      className={cn("toaster group", className)}
      icons={{
        success: <CircleCheckIcon className="size-4 text-success" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
        ...icons,
      }}
      style={
        {
          "--normal-bg": "var(--popover-bg)",
          "--normal-text": "var(--text)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-mark)",
          ...style,
        } as React.CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        classNames: {
          ...toastOptions?.classNames,
          toast: cn("cn-toast", toastOptions?.classNames?.toast),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
