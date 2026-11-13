import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import { catalog, getItem, installCommand, items, type Item, setupSteps, siteUrl } from "@/site/catalog";
import { designNotes, variantsOf } from "@/site/notes";

const codeBlock = (code: string, lang: string) => `\`\`\`${lang}\n${code.trimEnd()}\n\`\`\``;

const itemLink = ({ name, title }: Item) => `[${title}](${siteUrl}/md/components/${name}.md)`;

export const markdownResponse = (markdown: string) =>
  new Response(markdown, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });

export function overviewMarkdown() {
  return [
    "# Abnormal UI",
    `Design tokens, base components and brand pieces shared by the website and mail, as a shadcn registry of ${items.length} items. Each one installs as source into the project.`,
    `The machine-readable index is [registry.json](${siteUrl}/r/registry.json), and each item is at \`${siteUrl}/r/{name}.json\`.`,
    "## Get started",
    ...setupSteps.map(({ title, code, lang }, index) => `${index + 1}. ${title}\n\n${codeBlock(code, lang)}`),
    ...catalog.flatMap((group) => [
      `## ${group.title}`,
      group.items.map((item) => `- ${itemLink(item)}: ${item.description}`).join("\n"),
    ]),
  ].join("\n\n");
}

/**
 * llms.txt (https://llmstxt.org/): the registry in one paragraph, how to add it, then every item by group, linking each item's
 * Markdown. The overview Markdown carries the same list with the setup commands; this is the index agents look for first.
 */
export function llmsTxt() {
  return `${[
    "# Abnormal UI",
    `> The shadcn registry behind the Abnormal website and mail: design tokens, base components and brand pieces, ${items.length} items installed as source into each project.`,
    `Add the registry to \`components.json\` as \`"@abnormal": "${siteUrl}/r/{name}.json"\`, then install an item with \`${installCommand("button")}\`. The machine-readable index is [registry.json](${siteUrl}/r/registry.json); the overview with the setup steps is [index.md](${siteUrl}/md/index.md).`,
    ...catalog.flatMap((group) => [
      `## ${group.title}`,
      group.items.map((item) => `- ${itemLink(item)}: ${item.description}`).join("\n"),
    ]),
  ].join("\n\n")}\n`;
}

export async function itemMarkdown(item: Item) {
  // Route handlers are exported at build, so these files are never read at runtime.
  const usage = await readFile(`src/demos/${item.name}.tsx`, "utf8");
  const sources = await Promise.all(item.files.map(async ({ path }) => ({ path, code: await readFile(path, "utf8") })));
  const requires = item.registryDependencies?.map((name) => getItem(name.replace("@abnormal/", ""))!) ?? [];
  const brings = [...requires.map(itemLink), ...(item.dependencies ?? []).map((name) => `\`${name}\``)];
  const code = sources.filter(({ path }) => /\.tsx?$/.test(path));
  const notes = code.flatMap(({ code: text }) => designNotes(text));
  const variants = code.flatMap(({ code: text }) => variantsOf(text));

  return [
    `# ${item.title}`,
    item.description,
    `Registry item: [${item.name}.json](${siteUrl}/r/${item.name}.json)`,
    ...(notes.length > 0 ? ["## Design notes", notes.map((note) => `- ${note}`).join("\n")] : []),
    ...(variants.length > 0
      ? [
          "## Variants",
          variants
            .map(
              ({ name, options, defaultOption }) =>
                `- \`${name}\`: ${options.map((option) => `\`${option}\``).join(", ")}${defaultOption ? ` (default \`${defaultOption}\`)` : ""}`,
            )
            .join("\n"),
        ]
      : []),
    "## Install",
    codeBlock(installCommand(item.name), "bash"),
    ...(brings.length > 0 ? [`Brings in ${brings.join(", ")}.`] : []),
    "## Usage",
    codeBlock(usage, "tsx"),
    // An item can bring several files (table brings table-row.ts), and each one is installed, as on the page.
    ...sources.flatMap(({ path, code }) => [
      sources.length > 1 ? `## Source: ${basename(path)}` : "## Source",
      codeBlock(code, extname(path).slice(1)),
    ]),
  ].join("\n\n");
}
