import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import worker from "../src/worker.ts";

const registry: { items: { name: string; title: string }[] } = JSON.parse(readFileSync("registry.json", "utf8"));
const names = registry.items.map(({ name }) => name);
const site = "https://ui.abnormalhq.com";

test("robots.txt allows crawling, declares content signals and points at the sitemap", () => {
  const robots = readFileSync("out/robots.txt", "utf8");
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, /^Content-Signal: search=yes, ai-input=yes, ai-train=no$/m);
  assert.match(robots, new RegExp(`^Sitemap: ${site}/sitemap.xml$`, "m"));
});

test("the sitemap lists the overview and every component page", () => {
  const urls = [...readFileSync("out/sitemap.xml", "utf8").matchAll(/<loc>(.+?)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(urls.toSorted(), [site, ...names.map((name) => `${site}/components/${name}`)].toSorted());
});

test("the pages in the sitemap can be indexed", () => {
  for (const file of ["index", ...names.map((name) => `components/${name}`)]) {
    assert.doesNotMatch(readFileSync(`out/${file}.html`, "utf8"), /<meta name="robots"/, file);
  }
});

test("the overview Markdown links every item's Markdown and the registry", () => {
  const markdown = readFileSync("out/md/index.md", "utf8");
  assert.ok(markdown.startsWith("# Abnormal UI\n"));
  assert.ok(markdown.includes(`${site}/r/registry.json`));
  for (const name of names) assert.ok(markdown.includes(`(${site}/md/components/${name}.md)`), name);
});

test("each item's Markdown has its install command and its demo's source", () => {
  for (const { name, title } of registry.items) {
    const markdown = readFileSync(`out/md/components/${name}.md`, "utf8");
    assert.ok(markdown.startsWith(`# ${title}\n`), name);
    assert.ok(markdown.includes(`pnpm dlx shadcn@latest add @abnormal/${name}`), name);
    assert.ok(markdown.includes(readFileSync(`src/demos/${name}.tsx`, "utf8").trimEnd()), name);
    assert.equal(markdown.split("```").length % 2, 1, `${name} has unbalanced code fences`);
  }
});

/** Runs the Worker against a stand-in for the assets binding that echoes the path it was asked for. */
async function request(path: string, accept?: string) {
  const asked: string[] = [];
  const ASSETS = {
    fetch: (async (input: Request) => {
      asked.push(new URL(input.url).pathname);
      return new Response("asset", { headers: { Vary: "Accept-Encoding" } });
    }) as typeof fetch,
  };
  const headers = accept ? { Accept: accept } : undefined;
  const response = await worker.fetch(new Request(`${site}${path}`, { headers }), { ASSETS });
  return { asked: asked[0], response };
}

const browser = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";

for (const [accept, served] of [
  ["text/markdown", "/md/index.md"],
  ["TEXT/MARKDOWN", "/md/index.md"],
  ["text/markdown, text/html, */*", "/md/index.md"],
  ["text/html;q=0.5, text/markdown", "/md/index.md"],
  [browser, "/"],
  ["*/*", "/"],
  ["text/markdown;q=0.5, text/html", "/"],
  ["text/markdown;q=0", "/"],
  [undefined, "/"],
] as const) {
  test(`Accept: ${accept} on the overview serves ${served}`, async () => {
    assert.equal((await request("/", accept)).asked, served);
  });
}

test("a component page serves its own Markdown when asked for it", async () => {
  assert.equal((await request("/components/button", "text/markdown")).asked, "/md/components/button.md");
  assert.equal((await request("/components/button", browser)).asked, "/components/button");
});

test("paths that aren't pages pass through untouched, whatever they accept", async () => {
  for (const path of ["/components/nope", "/components/button.txt", "/components/button/"]) {
    const { asked, response } = await request(path, "text/markdown");
    assert.equal(asked, path);
    assert.equal(response.headers.get("Link"), null, path);
  }
});

test("pages say they vary on Accept in both representations and keep the asset's Vary", async () => {
  for (const accept of [browser, "text/markdown"]) {
    const { response } = await request("/components/button", accept);
    assert.equal(response.headers.get("Vary"), "Accept-Encoding, Accept");
  }
});

test("the overview's Link header points at the registry, its Markdown and every component page", async () => {
  const link = (await request("/")).response.headers.get("Link")!;
  assert.ok(link.includes(`</r/registry.json>; rel="describedby"; type="application/json"`));
  assert.ok(link.includes(`</md/index.md>; rel="alternate"; type="text/markdown"`));
  for (const name of names) assert.ok(link.includes(`</components/${name}>; rel="item"`), name);
});
