import "./globals.css";
import Link from "next/link";
import { ThemeScript } from "@/components/ui/theme-script";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <head>
        <title>Page not found · 页面未找到 · Abnormal UI</title>
        <ThemeScript />
        <link rel="preload" href="/fonts/Inter-Variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="/fonts/BricolageGrotesque-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <main className="mx-auto grid min-h-screen max-w-3xl content-center gap-6 px-6 py-16">
          <p className="font-mono text-sm text-muted-foreground">404</p>
          <h1 className="font-heading text-4xl font-semibold">
            Nothing here · <span lang="zh-CN">这里什么也没有</span>
          </h1>
          <div className="grid gap-3 text-muted-foreground">
            <p>This page or registry item does not exist.</p>
            <p lang="zh-CN">此页面或组件条目不存在。</p>
          </div>
          <nav aria-label="Home pages" className="flex flex-wrap gap-4">
            <Link className="underline underline-offset-4" href="/">
              Back to the overview
            </Link>
            <Link className="underline underline-offset-4" href="/zh" lang="zh-CN">
              中文首页
            </Link>
          </nav>
        </main>
      </body>
    </html>
  );
}
