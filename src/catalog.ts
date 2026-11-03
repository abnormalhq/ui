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
