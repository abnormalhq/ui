const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // The same types as abnormalhq, onboard and mail (ops for operational changes).
    "type-enum": [
      2,
      "always",
      ["build", "chore", "ci", "docs", "feat", "fix", "ops", "perf", "refactor", "revert", "style", "test"],
    ],
    "body-max-line-length": [0],
    "footer-max-line-length": [0],
  },
};

export default config;
