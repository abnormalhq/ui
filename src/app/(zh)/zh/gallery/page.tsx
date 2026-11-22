import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import GalleryPage from "@/site/site-pages/gallery-page";
import { pageMetadata } from "@/site/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("zh-CN", "gallery");
}

export default function Page() {
  setRequestLocale("zh-CN");
  return <GalleryPage locale="zh-CN" />;
}
