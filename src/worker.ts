import registry from "../registry.json" with { type: "json" };

/**
 * Serves the exported files and renders nothing. Static assets can't vary on a request header, so the
 * pages come through here to pick their Markdown file on `Accept: text/markdown` and to carry `Link`.
 * Everything else, /r and /_next included, never reaches this code (see run_worker_first in wrangler.jsonc).
 */
type Env = { ASSETS: { fetch: typeof fetch } };

const names = registry.items.map(({ name }) => name);

const alternate = (path: string) => `<${path}>; rel="alternate"; type="text/markdown"`;

const pages = new Map(
  names.map((name) => [
    `/components/${name}`,
    { markdown: `/md/components/${name}.md`, link: alternate(`/md/components/${name}.md`) },
  ]),
);
pages.set("/", {
  markdown: "/md/index.md",
  link: [
    alternate("/md/index.md"),
    `</r/registry.json>; rel="describedby"; type="application/json"`,
    ...names.map((name) => `</components/${name}>; rel="item"; type="text/html"`),
  ].join(", "),
});

type MediaRange = { type: string; params: string[]; q: number };

function parseAccept(accept: string | null): MediaRange[] {
  return (accept ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => {
      const [type = "", ...rest] = part.split(";").map((value) => value.trim());
      const qIndex = rest.findIndex((param) => param.startsWith("q="));
      // Everything after q is accept-ext, not media type parameters.
      const params = qIndex < 0 ? rest : rest.slice(0, qIndex);
      return {
        type,
        // RFC 9110 allows empty parameters, such as a stray trailing semicolon in text/markdown;.
        params: params.filter(Boolean).map((param) => param.replaceAll('"', "")),
        q: qIndex < 0 ? 1 : Number(rest[qIndex]!.slice(2)),
      };
    });
}

/**
 * The weight a range gives our response. Both responses are charset=utf-8, so ranges with other parameters do not
 * match; a range with parameters is more specific than one without (RFC 9110) and wins.
 */
function weightOf(ranges: MediaRange[], type: string): number | undefined {
  const matching = ranges.filter((range) => range.type === type && range.params.every((p) => p === "charset=utf-8"));
  return (matching.find((range) => range.params.length > 0) ?? matching[0])?.q;
}

/**
 * The same rules as the website's negotiation. Markdown is only considered when text/markdown is spelled out, so
 * requests with only wildcards still get HTML. HTML takes the weight of the most specific matching range, a
 * wildcard when nothing names it; on a tie Markdown wins, since browsers never send text/markdown.
 */
function wantsMarkdown(request: Request) {
  const ranges = parseAccept(request.headers.get("Accept"));
  const markdown = weightOf(ranges, "text/markdown") ?? 0;
  const html = weightOf(ranges, "text/html") ?? weightOf(ranges, "text/*") ?? weightOf(ranges, "*/*") ?? 0;
  return markdown > 0 && markdown >= html;
}

const worker = {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const page = pages.get(url.pathname);
    if (!page) return env.ASSETS.fetch(request);

    const asset = await env.ASSETS.fetch(
      wantsMarkdown(request) ? new Request(new URL(page.markdown, url), request) : request,
    );
    const response = new Response(asset.body, asset);
    response.headers.set("Link", page.link);
    response.headers.append("Vary", "Accept");
    return response;
  },
};

export default worker;
