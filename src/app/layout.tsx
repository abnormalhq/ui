import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { preload } from "react-dom";
import { catalog } from "@/site/catalog";
import { SiteHeader } from "@/site/components/site-header";
import { SiteNav } from "@/site/components/site-nav";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ui.abnormalhq.com"),
  title: { default: "Abnormal UI", template: "%s · Abnormal UI" },
  description: "The shadcn registry behind the Abnormal website and mail.",
};

const groups = catalog.map(({ title, items }) => ({
  title,
  items: items.map(({ name, title: itemTitle }) => ({ name, title: itemTitle })),
}));

// The fonts come only from @font-face in abnormal-fonts.css, which the browser reads late (after the style sheet, and only once text
// needs them); preloading starts all three with the page. crossOrigin: font requests are always CORS, so a preload without it is not reused.
const fontOptions = { as: "font", type: "font/woff2", crossOrigin: "anonymous" } as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  preload("/fonts/Inter-Variable.woff2", fontOptions);
  preload("/fonts/BricolageGrotesque-Variable.woff2", fontOptions);
  // Every page of the registry shows code (install commands, usage, sources).
  preload("/fonts/JetBrainsMono-Variable.woff2", fontOptions);
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" disableTransitionOnChange>
          <SiteHeader groups={groups} />
          <div className="mx-auto flex w-full max-w-[1400px]">
            <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r border-border px-3 py-6 lg:block">
              <SiteNav groups={groups} />
            </aside>
            <main className="min-w-0 flex-1 px-4 py-10 md:px-10 md:py-12">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
