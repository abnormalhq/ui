import { getItem, siteUrl } from "@/site/catalog";
import { featured, galleryTokens } from "@/site/gallery";
import { markdownResponse } from "@/site/markdown";

export const dynamic = "force-static";

export async function GET() {
  const { colors, sizes } = await galleryTokens();
  return markdownResponse(
    [
      "# Component gallery",
      `[Open the live gallery](${siteUrl}/gallery) or [browse the full registry](${siteUrl}/md/index.md).`,
      "## Component variants",
      featured
        .map((name) => `- [${getItem(name)!.title} usage and source](${siteUrl}/md/components/${name}.md)`)
        .join("\n"),
      "## Color tokens",
      [
        "| CSS reference | Light | Dark |",
        "| --- | --- | --- |",
        ...colors.map(({ reference, light, dark }) => `| \`${reference}\` | ${light} | ${dark} |`),
      ].join("\n"),
      "## Typography",
      `[Font families and usage](${siteUrl}/md/components/fonts.md)`,
      sizes.map(({ name, size, leading }) => `- \`${name}\` — ${size} / ${leading}`).join("\n"),
    ].join("\n\n") + "\n",
  );
}
