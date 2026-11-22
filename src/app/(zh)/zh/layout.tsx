import type { Metadata } from "next";
import { SiteLayout } from "@/site/components/site-layout";
import { siteMetadata } from "@/site/metadata";
import "../../globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return siteMetadata("zh-CN");
}

export default function ChineseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteLayout locale="zh-CN">{children}</SiteLayout>;
}
