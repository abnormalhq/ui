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

/** The weight the Accept header gives a media type, or 0 when it isn't named. */
function weight(accept: string, type: string) {
  const range = accept.split(",").find((part) => part.split(";")[0]!.trim().toLowerCase() === type);
  if (!range) return 0;
  const q = range.match(/;\s*q=([\d.]+)/i)?.[1];
  return q === undefined ? 1 : Number(q);
}

function wantsMarkdown(request: Request) {
  const accept = request.headers.get("Accept") ?? "";
  const markdown = weight(accept, "text/markdown");
  return markdown > 0 && markdown >= weight(accept, "text/html");
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
