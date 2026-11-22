import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import ComponentPage, { componentMetadata } from "@/site/site-pages/component-page";
import { items } from "@/site/catalog";

type Props = { params: Promise<{ name: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return items.map(({ name }) => ({ name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return componentMetadata("zh-CN", (await params).name);
}

export default async function Page({ params }: Props) {
  setRequestLocale("zh-CN");
  const { name } = await params;
  return <ComponentPage name={name} locale="zh-CN" />;
}
