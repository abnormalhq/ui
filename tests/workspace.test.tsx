import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ItemListRow } from "@/components/ui/item-list";
import { Workspace, WorkspaceNavigation, WorkspacePane } from "@/components/ui/workspace";
import { ReadingPreview } from "@/site/components/reading-preview";
import { click, render } from "./support/render.tsx";

test("paper panes are siblings of the ink scope, including when supplying semantic elements", () => {
  const html = renderToStaticMarkup(
    <Workspace>
      <WorkspaceNavigation asChild>
        <nav aria-label="Folders">Navigation</nav>
      </WorkspaceNavigation>
      <WorkspacePane asChild>
        <article aria-label="Message">Paper</article>
      </WorkspacePane>
    </Workspace>,
  );
  assert.match(html, /<nav aria-label="Folders"[^>]*class="ink /);
  assert.match(html, /<\/nav><article aria-label="Message"/);
  const paper = html.match(/<article[^>]*>/)![0];
  assert.match(paper, /bg-background text-foreground/);
  assert.doesNotMatch(paper, /class="[^"]*\bink\b/);
  assert.doesNotMatch(html, /<main|h-dvh|overflow-hidden|<script/);
});

test("a selected compact list row keeps the child's element and state semantics", () => {
  const html = renderToStaticMarkup(
    <ItemListRow asChild selected density="compact">
      <button type="button" aria-pressed="true">
        Read message
      </button>
    </ItemListRow>,
  );
  assert.match(html, /^<button type="button" aria-pressed="true"/);
  assert.match(html, /data-selected="true"/);
  assert.match(html, /data-density="compact"/);
  assert.match(html, /bg-highlight-muted/);
  assert.doesNotMatch(html, /aria-selected|selected=""|density="compact"(?=\s*\/?>)/);
  // Existing consumers keep their spacing and do not acquire selection semantics.
  const unchanged = renderToStaticMarkup(<ItemListRow>Unchanged</ItemListRow>);
  assert.match(unchanged, /px-4 py-3/);
  assert.doesNotMatch(unchanged, /data-selected|aria-pressed|aria-current/);
});

test("reading selection updates the controlled pane and keeps exactly one pressed message", async () => {
  const view = await render(<ReadingPreview />);
  try {
    const rows = [...view.container.querySelectorAll<HTMLButtonElement>("[data-slot='item-list-row']")];
    const reader = document.getElementById(rows[0]!.getAttribute("aria-controls")!);
    assert.equal(reader?.querySelector("h3")?.textContent, "Next week's plan");
    await click(rows[1]!);
    assert.equal(reader?.querySelector("h3")?.textContent, "A quieter workspace");
    assert.match(reader!.textContent!, /A useful interface does not have to compete/);
    assert.deepEqual(
      rows.map((row) => row.getAttribute("aria-pressed")),
      ["false", "true", "false"],
    );
    assert.deepEqual(
      rows.map((row) => row.hasAttribute("data-selected")),
      [false, true, false],
    );
  } finally {
    await view.unmount();
  }
});
