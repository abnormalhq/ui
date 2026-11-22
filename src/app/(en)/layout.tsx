import type { Metadata } from "next";
import { SiteLayout } from "@/site/components/site-layout";
import { siteMetadata } from "@/site/metadata";
import "../globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return siteMetadata("en");
}

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteLayout locale="en">{children}</SiteLayout>;
}
