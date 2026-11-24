import "./globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NotFound,
  NotFoundActions,
  NotFoundAside,
  NotFoundCode,
  NotFoundDescription,
  NotFoundTitle,
} from "@/components/ui/not-found";
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
        <NotFound className="min-h-svh">
          <NotFoundCode>404</NotFoundCode>
          <NotFoundTitle>Nothing here</NotFoundTitle>
          <NotFoundDescription>This page or registry item does not exist.</NotFoundDescription>
          <NotFoundActions>
            <Button asChild>
              <Link href="/">Back to the overview</Link>
            </Button>
          </NotFoundActions>
          <NotFoundAside lang="zh-CN">
            <p className="font-medium text-foreground">这里什么也没有</p>
            <p className="mt-1">此页面或组件条目不存在。</p>
            <p className="mt-3">
              <Link className="underline decoration-current/40 underline-offset-4 hover:text-foreground" href="/zh">
                返回中文首页
              </Link>
            </p>
          </NotFoundAside>
        </NotFound>
      </body>
    </html>
  );
}
