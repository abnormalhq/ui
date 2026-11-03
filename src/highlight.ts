import { createCssVariablesTheme, createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

export type CodeLang = "bash" | "css" | "json" | "ts" | "tsx";

// Colors come from the --shiki-* variables in globals.css, so one output serves both themes.
const theme = createCssVariablesTheme({ name: "abnormal", fontStyle: false });

// Only these grammars and no WASM: the page modules are bundled into the Worker even though every page is prerendered.
const highlighter = createHighlighterCore({
  themes: [theme],
  langs: [
    import("@shikijs/langs/bash"),
    import("@shikijs/langs/css"),
    import("@shikijs/langs/json"),
    import("@shikijs/langs/ts"),
    import("@shikijs/langs/tsx"),
  ],
  engine: createJavaScriptRegexEngine(),
});

/** Returns token spans separated by <br>, to go inside a <code>. */
export async function highlight(code: string, lang: CodeLang) {
  return (await highlighter).codeToHtml(code, { lang, theme: theme.name!, structure: "inline" });
}
