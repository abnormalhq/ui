import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { catalog, getItem, installCommand, items, type Item, setupSteps, siteUrl } from "@/site/catalog";

const codeBlock = (code: string, lang: string) => `\`\`\`${lang}\n${code.trimEnd()}\n\`\`\``;

const itemLink = ({ name, title }: Item) => `[${title}](${siteUrl}/md/components/${name}.md)`;

export const markdownResponse = (markdown: string) =>
  new Response(markdown, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });

export function overviewMarkdown() {
  return [
    "# Abnormal UI",
    `Design tokens, base components and brand pieces shared by the website, onboard and mail, as a shadcn registry of ${items.length} items. Each one installs as source into the project.`,
    `The machine-readable index is [registry.json](${siteUrl}/r/registry.json), and each item is at \`${siteUrl}/r/{name}.json\`.`,
    "## Get started",
    ...setupSteps.map(({ title, code, lang }, index) => `${index + 1}. ${title}\n\n${codeBlock(code, lang)}`),
    ...catalog.flatMap((group) => [
      `## ${group.title}`,
      group.items.map((item) => `- ${itemLink(item)}: ${item.description}`).join("\n"),
    ]),
  ].join("\n\n");
}

export async function itemMarkdown(item: Item) {
  // Route handlers are exported at build, so these files are never read at runtime.
  const usage = await readFile(`src/demos/${item.name}.tsx`, "utf8");
  const sourcePath = item.files[0]!.path;
  const source = await readFile(sourcePath, "utf8");
  const requires = item.registryDependencies?.map((name) => getItem(name.replace("@abnormal/", ""))!) ?? [];
  const brings = [...requires.map(itemLink), ...(item.dependencies ?? []).map((name) => `\`${name}\``)];

  return [
    `# ${item.title}`,
    item.description,
    `Registry item: [${item.name}.json](${siteUrl}/r/${item.name}.json)`,
    "## Install",
    codeBlock(installCommand(item.name), "bash"),
    ...(brings.length > 0 ? [`Brings in ${brings.join(", ")}.`] : []),
    "## Usage",
    codeBlock(usage, "tsx"),
    "## Source",
    codeBlock(source, extname(sourcePath).slice(1)),
  ].join("\n\n");
}
