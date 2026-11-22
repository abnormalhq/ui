import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import GalleryPage from "@/site/site-pages/gallery-page";
import { pageMetadata } from "@/site/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("en", "gallery");
}

export default function Page() {
  setRequestLocale("en");
  return <GalleryPage locale="en" />;
}
