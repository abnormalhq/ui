import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import DesignPage from "@/site/site-pages/design-page";
import { pageMetadata } from "@/site/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("zh-CN", "design");
}

export default function Page() {
  setRequestLocale("zh-CN");
  return <DesignPage locale="zh-CN" />;
}
