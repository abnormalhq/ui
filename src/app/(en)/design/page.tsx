import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import DesignPage from "@/site/site-pages/design-page";
import { pageMetadata } from "@/site/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("en", "design");
}

export default function Page() {
  setRequestLocale("en");
  return <DesignPage locale="en" />;
}
