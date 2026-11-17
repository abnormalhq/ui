import { designMarkdown } from "@/site/design";
import { markdownResponse } from "@/site/markdown";

export const dynamic = "force-static";

export function GET() {
  return markdownResponse(designMarkdown());
}
