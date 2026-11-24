/*
 * Lets node --test import the registry and site components as they are: resolves the tsconfig path aliases and
 * compiles .tsx with TypeScript, the way Next and a project that installed the items would. Loaded with --import
 * from the test script, before any test file, so the hooks are in place when the first import resolves.
 */
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = new URL("../../", import.meta.url);
const tsconfig = JSON.parse(readFileSync(new URL("tsconfig.json", root), "utf8")) as {
  compilerOptions: { paths: Record<string, string[]> };
};
// "@/components/ui/*": ["./registry/ui/*", ...] becomes a prefix and the folders it may point at.
const aliases = Object.entries(tsconfig.compilerOptions.paths).map(([pattern, targets]) => ({
  prefix: pattern.replace(/\*$/, ""),
  folders: targets.map((target) => new URL(target.replace(/\*$/, ""), root)),
}));

const resolveAlias = (specifier: string) => {
  for (const { prefix, folders } of aliases) {
    if (!specifier.startsWith(prefix)) continue;
    const rest = specifier.slice(prefix.length);
    for (const folder of folders) {
      // Imports usually leave the extension out, as Next allows; a plain module (.mjs) keeps it.
      for (const extension of ["", ".tsx", ".ts"]) {
        if (extension === "" && !/\.m?js$/.test(rest)) continue;
        const candidate = new URL(rest + extension, folder);
        if (existsSync(candidate)) return candidate.href;
      }
    }
  }
  return undefined;
};

registerHooks({
  resolve(specifier, context, nextResolve) {
    const url = resolveAlias(specifier);
    if (url) return { url, shortCircuit: true };
    if (specifier.startsWith("next/") && !/\.[cm]?js$/.test(specifier)) {
      try {
        return nextResolve(specifier + ".js", context);
      } catch {
        return nextResolve(specifier, context);
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (!url.startsWith(root.href) || !url.endsWith(".tsx") || url.includes("/node_modules/")) {
      return nextLoad(url, context);
    }
    const { outputText } = ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
      fileName: fileURLToPath(url),
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        verbatimModuleSyntax: true,
        sourceMap: false,
      },
    });
    return { format: "module", source: outputText, shortCircuit: true };
  },
});
