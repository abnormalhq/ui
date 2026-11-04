import registry from "../registry.json";
import { groups } from "@/site/groups";

export type Item = {
  name: string;
  title: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: { path: string }[];
};

export const items: Item[] = registry.items;

export const getItem = (name: string) => items.find((item) => item.name === name);

export const catalog = groups.map(({ title, items: names }) => ({
  title,
  items: names.map((name) => getItem(name)!),
}));

export const installCommand = (...names: string[]) =>
  `pnpm dlx shadcn@latest add ${names.map((name) => `@abnormal/${name}`).join(" ")}`;

export const siteUrl = "https://ui.abnormalhq.com";

const componentsJson = `{
  "registries": {
    "@abnormal": "${siteUrl}/r/{name}.json"
  }
}`;

const cssEntry = `@import "tailwindcss";
@import "./abnormal.css";`;

export const setupSteps = [
  { title: "Add the registry to components.json", code: componentsJson, lang: "json" },
  { title: "Install the theme", code: installCommand("theme"), lang: "bash" },
  { title: "Import it right after Tailwind", code: cssEntry, lang: "css" },
  { title: "Install components", code: installCommand("button", "dialog"), lang: "bash" },
] as const;
