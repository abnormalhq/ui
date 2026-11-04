import { markdownResponse, overviewMarkdown } from "@/site/markdown";

export const dynamic = "force-static";

export function GET() {
  return markdownResponse(overviewMarkdown());
}
