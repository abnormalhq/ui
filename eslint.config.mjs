import { fixupConfigRules } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/*
 * The same rules the projects run on their installed copies (abnormalhq, onboard, mail): react-hooks, jsx-a11y and the
 * Next.js and TypeScript rules. Linting the registry here catches a hooks or a11y problem before a project reinstalls it.
 */
const eslintConfig = defineConfig([
  // eslint-plugin-react / import / jsx-a11y in eslint-config-next still call APIs ESLint 10 removed, such as
  // context.getFilename(); @eslint/compat adds them back. Drop the wrapper once they support ESLint 10.
  ...fixupConfigRules(nextVitals),
  ...fixupConfigRules(nextTs),
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
