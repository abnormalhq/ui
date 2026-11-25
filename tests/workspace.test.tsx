import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { AppFrame, AppFrameBody, AppFrameColumn, AppFrameSheet } from "@/components/ui/app-frame";
import { CardList, CardListCard, CardListDot } from "@/components/ui/card-list";
import { ItemListRow } from "@/components/ui/item-list";
import { ListToolbarFilter } from "@/components/ui/list-toolbar";
import { Sidebar, SidebarGroup, SidebarItem, SidebarMore, SidebarNav } from "@/components/ui/sidebar";
import { Workspace, WorkspaceNavigation, WorkspacePane } from "@/components/ui/workspace";
import { ReadingPreview } from "@/site/components/reading-preview";
import { click, render } from "./support/render.tsx";

const englishMessages = JSON.parse(readFileSync("src/i18n/messages/en.json", "utf8"));

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
  const view = await render(
    <NextIntlClientProvider locale="en" timeZone="UTC" messages={{ Previews: englishMessages.Previews }}>
      <ReadingPreview />
    </NextIntlClientProvider>,
  );
  try {
    const rows = [...view.container.querySelectorAll<HTMLButtonElement>("[data-slot='item-list-row']")];
    const reader = document.getElementById(rows[0]!.getAttribute("aria-controls")!);
    assert.equal(reader?.querySelector("h3")?.textContent, "Next week's plan");
    await click(rows[1]!);
    assert.equal(reader?.querySelector("h3")?.textContent, "A quieter workspace");
    assert.match(reader.textContent, /A useful interface does not have to compete/);
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

test("the canvas frame keeps the sheet out of the ink scope and clips without scrolling", () => {
  const html = renderToStaticMarkup(
    <AppFrame>
      <AppFrameBody>
        <AppFrameColumn asChild>
          <nav aria-label="Folders">Navigation</nav>
        </AppFrameColumn>
        <AppFrameSheet asChild>
          <article aria-label="Message">Paper</article>
        </AppFrameSheet>
      </AppFrameBody>
    </AppFrame>,
  );
  assert.match(html, /^<div data-slot="app-frame" class="[^"]*\bbg-canvas\b/);
  assert.match(html, /<nav aria-label="Folders" data-slot="app-frame-column"/);
  const sheet = html.match(/<article[^>]*>/)![0];
  assert.match(sheet, /bg-background/);
  assert.match(sheet, /shadow-sheet/);
  assert.match(sheet, /overflow-clip/);
  assert.doesNotMatch(html, /\bink\b|overflow-hidden|overflow-auto|h-dvh/);
});

test("a selected card is lifted with the bar and an unread one lights its dot, without adding semantics", () => {
  const html = renderToStaticMarkup(
    <CardListCard asChild selected unread>
      <a href="#one" aria-current="true">
        <CardListDot />
        Lin Shu
      </a>
    </CardListCard>,
  );
  assert.match(
    html,
    /^<a href="#one" aria-current="true" data-slot="card-list-card" data-selected="true" data-unread="true"/,
  );
  assert.match(html, /before:bg-highlight/);
  assert.match(html, /group-data-unread\/card:inline-block/);
  const labelled = renderToStaticMarkup(<CardListDot label="Unread" />);
  // The label is visually hidden and shows (to a screen reader) only while the card above it is unread.
  assert.match(labelled, /<span class="sr-only hidden group-data-unread\/card:inline">Unread<\/span>$/);
  assert.doesNotMatch(renderToStaticMarkup(<CardListDot />), /sr-only/);
  assert.match(renderToStaticMarkup(<CardList />), /^<ul role="list"/);
  const plain = renderToStaticMarkup(<CardListCard>Plain</CardListCard>);
  assert.doesNotMatch(plain, /data-selected|data-unread|aria-/);
});

test("a filter chip shows its field and value, and the add chip has no chevron", () => {
  const chip = renderToStaticMarkup(<ListToolbarFilter label="Status" value="Open" />);
  assert.match(chip, /^<button type="button" data-slot="list-toolbar-filter"/);
  assert.match(chip, />Status<\/span><span class="truncate font-medium">Open<\/span><svg/);
  const add = renderToStaticMarkup(<ListToolbarFilter add label="Add filter" />);
  assert.match(add, /data-add="true"/);
  assert.match(add, /border-dashed/);
  assert.doesNotMatch(add, /<svg/);
});

test("sidebar groups are named by their label and More folds its rows behind aria-expanded", async () => {
  const view = await render(
    <Sidebar>
      <SidebarNav label="Folders">
        <SidebarItem icon={<span />} label="Inbox" />
        <SidebarMore moreLabel="More" lessLabel="Less">
          <SidebarItem icon={<span />} label="Sent" />
        </SidebarMore>
        <SidebarGroup label="Labels">
          <SidebarItem icon={<span />} label="Work" />
        </SidebarGroup>
      </SidebarNav>
    </Sidebar>,
  );
  try {
    const group = view.container.querySelector<HTMLElement>("[data-slot='sidebar-group']")!;
    assert.equal(group.getAttribute("role"), "group");
    assert.equal(document.getElementById(group.getAttribute("aria-labelledby")!)?.textContent, "Labels");
    const more = view.container.querySelector<HTMLElement>("[data-slot='sidebar-more']")!;
    const toggle = view.container.querySelector<HTMLButtonElement>(`[aria-controls='${more.id}']`)!;
    assert.equal(more.hidden, true);
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
    assert.match(toggle.textContent, /More/);
    await click(toggle);
    assert.equal(more.hidden, false);
    assert.equal(toggle.getAttribute("aria-expanded"), "true");
    assert.match(toggle.textContent, /Less/);
  } finally {
    await view.unmount();
  }
});
