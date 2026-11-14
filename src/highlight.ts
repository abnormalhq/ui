import { createCssVariablesTheme, createHighlighterCore, type ShikiTransformer } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

export type CodeLang = "bash" | "css" | "json" | "ts" | "tsx";

// Colors come from the --shiki-* variables in globals.css, so one output serves both themes.
const theme = createCssVariablesTheme({ name: "abnormal", fontStyle: false });

// Only these grammars and no WASM, to keep the build light.
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

/**
 * The token colors globals.css gives a class (.sk-*), each the same --shiki-* variable the theme would write inline. A span
 * takes the short class instead of style="color:var(--shiki-…)", which makes up most of a code block's markup; a color
 * without a class keeps its inline style, so nothing is drawn differently.
 */
export const tokenClasses: Record<string, string> = Object.fromEntries(
  [
    "foreground",
    "token-comment",
    "token-punctuation",
    "token-parameter",
    "token-keyword",
    "token-string",
    "token-string-expression",
    "token-link",
    "token-function",
    "token-constant",
  ].map((name) => [`color:var(--shiki-${name})`, `sk-${name.replace(/^token-/, "")}`]),
);

const colorClasses: ShikiTransformer = {
  name: "abnormal:color-classes",
  span(node) {
    const style = node.properties.style;
    const className = typeof style === "string" ? tokenClasses[style] : undefined;
    if (!className) return;
    delete node.properties.style;
    this.addClassToHast(node, className);
  },
};

/** Returns token spans separated by <br>, to go inside a <code>. */
export async function highlight(code: string, lang: CodeLang) {
  return (await highlighter).codeToHtml(code, {
    lang,
    theme: theme.name!,
    structure: "inline",
    transformers: [colorClasses],
  });
}
