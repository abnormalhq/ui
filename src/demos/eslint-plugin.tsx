import { checkClass } from "@/lib/eslint-plugin-abnormal.mjs";

/* Each class is run through the rule itself, so what the page shows is what a project's lint reports. */
const examples = [
  ["text-zinc-500", "text-muted-foreground"],
  ["dark:text-amber-400", "text-warning"],
  ["bg-black/40", "bg-overlay"],
  ["text-[13px]", "text-sm"],
  ["mt-[18px]", "mt-4.5"],
  ["rounded-md", "rounded-control"],
  ["z-50", "z-overlay"],
  ["tracking-[-0.02em]", "tracking-heading"],
] as const;

export const defaultCopy = {
  instead: "Instead of",
  use: "Use",
  reported: "Reported",
};

export default function EslintPluginDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <table className="w-full text-left text-sm">
      <thead className="text-xs text-muted-foreground">
        <tr>
          <th className="py-1.5 pr-4 font-normal">{copy.instead}</th>
          <th className="py-1.5 pr-4 font-normal">{copy.use}</th>
          <th className="py-1.5 font-normal">{copy.reported}</th>
        </tr>
      </thead>
      <tbody className="font-mono text-xs">
        {examples.map(([wrong, right]) => (
          <tr key={wrong} className="border-t border-border">
            <td className="py-1.5 pr-4 text-destructive">{wrong}</td>
            <td className="py-1.5 pr-4 text-success">{right}</td>
            <td className="py-1.5">{checkClass(wrong) ? "✓" : ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
