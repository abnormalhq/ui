// On commit, process only staged files: code gets eslint --fix then prettier, everything else prettier can format is left to prettier.
// The glob groups do not overlap, so the same file is never rewritten by parallel tasks at once.
const config = {
  "*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}": ["eslint --fix --no-warn-ignored", "prettier --write"],
  // Stylesheets get the theme checks (abnormal/no-hardcoded-css) before prettier, so a hardcoded value fails here, not first in CI.
  "*.css": ["eslint --no-warn-ignored", "prettier --write"],
  "*.{json,jsonc,md,mdx,html,yml,yaml}": "prettier --write",
};

export default config;
