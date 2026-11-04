// On commit, process only staged files: code gets eslint --fix then prettier, everything else prettier can format is left to prettier.
// The two glob groups do not overlap, so the same file is never rewritten by parallel tasks at once.
const config = {
  "*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}": ["eslint --fix --no-warn-ignored", "prettier --write"],
  "*.{json,jsonc,md,mdx,css,html,yml,yaml}": "prettier --write",
};

export default config;
