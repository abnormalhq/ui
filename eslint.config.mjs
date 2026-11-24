import { fixupConfigRules } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import css from "@eslint/css";
import { tailwind4 } from "tailwind-csstree";
import abnormal from "./registry/lib/eslint-plugin-abnormal.mjs";

/*
 * The same rules the projects run on their installed copies (abnormalhq, mail): react-hooks, jsx-a11y and the
 * Next.js and TypeScript rules. Linting the registry here catches a hooks or a11y problem before a project reinstalls it.
 */
/*
 * The Next.js configs carry no `files`, so they would also run on the CSS files linted below, whose language their rules
 * cannot read. Scope each of their blocks that sets rules to scripts.
 */
const scripts = (configs) =>
  configs.map((config) =>
    config.files || !(config.rules || config.plugins || config.languageOptions)
      ? config
      : { ...config, files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"] },
  );

const eslintConfig = defineConfig([
  // eslint-plugin-react / import / jsx-a11y in eslint-config-next still call APIs ESLint 10 removed, such as
  // context.getFilename(); @eslint/compat adds them back. Drop the wrapper once they support ESLint 10.
  ...scripts(fixupConfigRules(nextVitals)),
  ...scripts(fixupConfigRules(nextTs)),
  {
    // A few of typescript-eslint's type-aware rules, as abnormalhq runs: awaiting something that is not a promise, promises
    // that are neither awaited nor handled, promises passed where a void callback is expected, and type assertions the
    // types already make pointless. Only the rules: eslint-config-next/typescript already registers the plugin and parser.
    files: ["**/*.{ts,tsx,mts}"],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-floating-promises": [
        "error",
        {
          // node:test runs the tests it registers; the promise test() and describe() return needs no handling.
          allowForKnownSafeCalls: [
            { from: "package", package: "node:test", name: ["test", "it", "describe", "suite"] },
          ],
        },
      ],
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
    },
  },
  {
    // A bare <select> shows the browser's own arrow pressed against the right edge; NativeSelect draws the chevron with room for it.
    files: ["**/*.tsx"],
    ignores: ["registry/ui/native-select.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name='select']",
          message: "Use NativeSelect from @/components/ui/native-select instead of a bare <select>.",
        },
      ],
    },
  },
  {
    // The registry's own rule, run on the registry and the site, as each project runs it on its own code.
    files: ["**/*.{ts,tsx}"],
    // Tests spell out the classes components render, and the rule's demo the classes it reports.
    ignores: ["tests/**", "src/demos/eslint-plugin.tsx"],
    plugins: { abnormal },
    rules: { "abnormal/no-hardcoded-classes": "error" },
  },
  {
    // The theme itself is where the literal values live.
    files: ["**/*.css"],
    ignores: ["registry/styles/abnormal.css", "registry/styles/abnormal-fonts.css"],
    language: "css/css",
    // Tailwind's syntax, so @theme, @utility and @apply with variants parse and every declaration in them is checked.
    languageOptions: { customSyntax: tailwind4 },
    plugins: { css, abnormal },
    rules: { "abnormal/no-hardcoded-css": "error" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "public/r/**",
    "next-env.d.ts",
    ".wrangler/**",
    // A Claude Code worktree is a whole copy of the repository.
    ".claude/**",
  ]),
]);

export default eslintConfig;
