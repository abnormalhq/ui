import { items, getItem } from "@/site/catalog";
import { itemMarkdown, markdownResponse } from "@/site/markdown";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return items.map(({ name }) => ({ file: `${name}.md` }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const item = getItem((await params).file.replace(/\.md$/, ""));
  return item ? markdownResponse(await itemMarkdown(item)) : new Response("Not found", { status: 404 });
}
