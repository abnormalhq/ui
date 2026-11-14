// The browser environment has to come first: see support/dom.ts.
import { click, render } from "./support/render.tsx";
import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { act, useState } from "react";
import { LanguagePicker } from "@/components/ui/language-picker";
import { NavTab, NavTabs } from "@/components/ui/nav-tabs";
import { ResizeHandle } from "@/components/ui/resize-handle";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarFooter,
  SidebarItem,
  SidebarNav,
  SidebarProvider,
  SidebarToggle,
} from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemePicker } from "@/components/ui/theme-picker";
import { Toc, TocLink, TocList } from "@/components/ui/toc";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@/components/ui/toolbar";
import { scrollIntoRow } from "@/components/ui/use-scroll-fade";
import { useSidebar } from "@/components/ui/use-sidebar";

const mounted: { unmount: () => Promise<void> }[] = [];
const mount = async (ui: React.ReactNode) => {
  const view = await render(ui);
  mounted.push(view);
  return view;
};
afterEach(async () => {
  for (const view of mounted.splice(0)) await view.unmount();
  mock.restoreAll();
});

/** A key, the way a keyboard sends it, then a tick for Radix to move a roving focus. */
const press = async (element: Element, key: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
  await act(async () => {
    element.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return event.defaultPrevented;
};
const tick = (ms = 0) => act(async () => void (await new Promise((resolve) => setTimeout(resolve, ms))));
const named = (name: string) => {
  const match = [...document.querySelectorAll<HTMLElement>("button, a")].find(
    (element) => (element.getAttribute("aria-label") ?? element.textContent?.trim()) === name,
  );
  assert.ok(match, `a control named ${name}`);
  return match;
};

const sidebar = (props: React.ComponentProps<typeof Sidebar> = {}) => (
  <Sidebar {...props}>
    <SidebarNav label="Main">
      <SidebarItem icon={<svg />} label="Inbox" count={12} countLabel="12 unread" attention current />
      <SidebarItem icon={<svg />} label="Archive" count={40} />
      <SidebarItem asChild icon={<svg />} label="Members" dot>
        <a href="/members" />
      </SidebarItem>
    </SidebarNav>
    <SidebarFooter>
      <SidebarToggle expandLabel="Expand sidebar" collapseLabel="Collapse sidebar" />
    </SidebarFooter>
  </Sidebar>
);
const column = () => document.querySelector<HTMLElement>('[data-slot="sidebar"]')!;
const label = (name: string) =>
  [...document.querySelectorAll('[data-slot="sidebar-item-label"]')].find((element) => element.textContent === name)!;

test("a Sidebar is a column with a named nav of rows, the current one marked, and its counts read as given", async () => {
  await mount(sidebar());
  assert.equal(column().tagName, "ASIDE");
  assert.equal(column().dataset.state, "expanded");
  assert.equal(document.querySelector("nav")?.getAttribute("aria-label"), "Main");

  const inbox = label("Inbox").closest("button")!;
  assert.equal(inbox.getAttribute("aria-current"), "page");
  assert.equal(inbox.getAttribute("type"), "button");
  // The number is shown, and read as "12 unread" instead.
  const count = inbox.querySelector('[data-slot="sidebar-item-count"]')!;
  assert.equal(count.textContent, "12");
  assert.equal(count.getAttribute("aria-hidden"), "true");
  assert.equal(inbox.querySelector(".sr-only")?.textContent, "12 unread");
  // A count without a label is read as shown.
  assert.equal(
    label("Archive").closest("button")!.querySelector('[data-slot="sidebar-item-count"]')!.hasAttribute("aria-hidden"),
    false,
  );
  // asChild puts the row in the link given.
  const members = label("Members").closest("a")!;
  assert.equal(members.getAttribute("href"), "/members");
  assert.equal(members.hasAttribute("type"), false);
  assert.ok(members.querySelector('[data-slot="sidebar-item-dot"]'));
});

test("the Sidebar toggle collapses it to a rail, keeps every row's name, and writes the cookie it is given", async () => {
  const onCollapsedChange = mock.fn();
  document.cookie = "sidebar=; max-age=0; path=/";
  await mount(sidebar({ cookieName: "sidebar", onCollapsedChange }));
  // Nothing is written before a change: the server already rendered the state it read.
  assert.doesNotMatch(document.cookie, /sidebar=/);

  await click(named("Collapse sidebar"));
  assert.equal(column().dataset.state, "collapsed");
  assert.deepEqual(onCollapsedChange.mock.calls[0]?.arguments, [true]);
  assert.match(document.cookie, /sidebar=collapsed/);
  // The name moves out of sight but stays in the row's name, and the count's reading with it.
  assert.equal(label("Inbox").className, "sr-only");
  const inbox = label("Inbox").closest("button")!;
  assert.match(inbox.textContent ?? "", /Inbox/);
  assert.match(inbox.textContent ?? "", /12 unread/);
  // The count asked for attention, so the rail shows a dot.
  assert.ok(inbox.querySelector('[data-slot="sidebar-item-dot"]'));

  await click(named("Expand sidebar"));
  assert.equal(column().dataset.state, "expanded");
  assert.match(document.cookie, /sidebar=expanded/);
});

test("the Sidebar shortcut toggles it from the page, but not while typing in a field", async () => {
  await mount(
    <>
      {sidebar({ shortcut: "b" })}
      <input aria-label="Subject" />
    </>,
  );
  assert.equal(named("Collapse sidebar").getAttribute("aria-keyshortcuts"), "Meta+B Control+B");
  assert.equal(await press(document.body, "b", { metaKey: true }), true);
  assert.equal(column().dataset.state, "collapsed");
  await press(document.body, "B", { ctrlKey: true });
  assert.equal(column().dataset.state, "expanded");
  // Bold in an editor, not the sidebar.
  assert.equal(await press(document.querySelector("input")!, "b", { metaKey: true }), false);
  assert.equal(column().dataset.state, "expanded");
  await press(document.body, "b");
  assert.equal(column().dataset.state, "expanded");
});

test("a controlled Sidebar waits for its owner, and a SidebarProvider shares its state with rows outside", async () => {
  const onCollapsedChange = mock.fn();
  await mount(sidebar({ collapsed: false, onCollapsedChange }));
  await click(named("Collapse sidebar"));
  assert.deepEqual(onCollapsedChange.mock.calls[0]?.arguments, [true]);
  assert.equal(column().dataset.state, "expanded");
  await mounted.pop()!.unmount();

  function State() {
    const { collapsed } = useSidebar();
    return <output>{collapsed ? "rail" : "rows"}</output>;
  }
  await mount(
    <SidebarProvider defaultCollapsed>
      <State />
      {sidebar()}
    </SidebarProvider>,
  );
  assert.equal(column().dataset.state, "collapsed");
  assert.equal(document.querySelector("output")?.textContent, "rail");
  await click(named("Expand sidebar"));
  assert.equal(document.querySelector("output")?.textContent, "rows");
  await mounted.pop()!.unmount();

  // Outside any sidebar a row reads as expanded.
  await mount(<State />);
  assert.equal(document.querySelector("output")?.textContent, "rows");
});

test("NavTabs are a named landmark of links, the current one marked with aria-current", async () => {
  await mount(
    <NavTabs label="Settings sections" variant="pill">
      <NavTab href="/settings">General</NavTab>
      <NavTab href="/settings/domains" current>
        Domains
      </NavTab>
      <NavTab href="#audit" current="location">
        Audit
      </NavTab>
    </NavTabs>,
  );
  const nav = document.querySelector("nav")!;
  assert.equal(nav.getAttribute("aria-label"), "Settings sections");
  assert.equal(nav.dataset.variant, "pill");
  assert.equal(nav.querySelectorAll("li > a").length, 3);
  assert.equal(named("General").hasAttribute("aria-current"), false);
  assert.equal(named("Domains").getAttribute("aria-current"), "page");
  assert.equal(named("Audit").getAttribute("aria-current"), "location");
});

test("NavTabs bring the current tab into view when it changes, and only when it is out of view", async () => {
  const tabs = (current: string) => (
    <NavTabs label="Period" variant="segmented">
      {["7d", "30d", "90d"].map((range) => (
        <NavTab key={range} href={`?range=${range}`} current={range === current}>
          {range}
        </NavTab>
      ))}
    </NavTabs>
  );
  const { rerender } = await mount(tabs("7d"));
  const list = document.querySelector<HTMLElement>('[data-slot="nav-tabs-list"]')!;
  const scrollTo = mock.fn();
  Object.assign(list, { scrollTo });
  Object.defineProperty(list, "clientWidth", { configurable: true, value: 100 });
  const rect = (left: number, width: number) => () => ({ left, width, right: left + width }) as DOMRect;
  list.getBoundingClientRect = rect(0, 100);
  named("90d").getBoundingClientRect = rect(180, 40);

  await rerender(tabs("90d"));
  await tick();
  assert.deepEqual(scrollTo.mock.calls[0]?.arguments, [{ left: 150, behavior: "smooth" }]);

  // A tab in view stays where it is.
  const row = document.createElement("div");
  const item = document.createElement("a");
  Object.defineProperty(row, "clientWidth", { value: 100 });
  row.getBoundingClientRect = rect(0, 100);
  item.getBoundingClientRect = rect(20, 40);
  const still = mock.fn();
  Object.assign(row, { scrollTo: still });
  scrollIntoRow(row, item);
  assert.equal(still.mock.callCount(), 0);
});

test("a Toolbar is one named tab stop, with arrow keys, Home and End moving past what is disabled", async () => {
  await mount(
    <Toolbar label="Formatting">
      <ToolbarButton aria-label="Image" />
      <ToolbarSeparator />
      <ToolbarGroup aria-label="Text style">
        <ToolbarButton aria-label="Bold" pressed />
        <ToolbarButton aria-label="Italic" pressed={false} disabled />
        <ToolbarButton aria-label="Underline" pressed={false} />
      </ToolbarGroup>
      <ToolbarButton aria-label="Link" />
    </Toolbar>,
  );
  const toolbar = document.querySelector('[role="toolbar"]')!;
  assert.equal(toolbar.getAttribute("aria-label"), "Formatting");
  assert.equal(document.querySelector('[role="separator"]')?.getAttribute("aria-orientation"), "vertical");
  assert.equal(named("Bold").getAttribute("aria-pressed"), "true");
  assert.equal(named("Underline").getAttribute("aria-pressed"), "false");
  assert.equal(named("Image").hasAttribute("aria-pressed"), false);

  const focused = () => document.activeElement?.getAttribute("aria-label");
  await act(async () => named("Image").focus());
  await press(named("Image"), "ArrowRight");
  assert.equal(focused(), "Bold");
  await press(named("Bold"), "ArrowRight");
  assert.equal(focused(), "Underline", "Italic is disabled");
  await press(named("Underline"), "End");
  assert.equal(focused(), "Link");
  await press(named("Link"), "ArrowRight");
  assert.equal(focused(), "Image", "wraps to the first");
  await press(named("Image"), "Home");
  assert.equal(focused(), "Image");
  // Roving tabindex: only the control last focused is in the tab order.
  const stops = [...toolbar.querySelectorAll("button:not(:disabled)")].filter(
    (button) => button.getAttribute("tabindex") === "0",
  );
  assert.equal(stops.length, 1);
});

test("a ResizeHandle is a named separator that the arrows, Home and End resize within its limits", async () => {
  const onValueChange = mock.fn();
  const onValueCommit = mock.fn();
  const onReset = mock.fn();
  const { rerender } = await mount(
    <ResizeHandle
      label="Resize the list"
      value={300}
      min={200}
      max={360}
      onValueChange={onValueChange}
      onValueCommit={onValueCommit}
      onReset={onReset}
    />,
  );
  const handle = document.querySelector<HTMLElement>('[role="separator"]')!;
  assert.equal(handle.getAttribute("aria-label"), "Resize the list");
  assert.equal(handle.getAttribute("aria-orientation"), "vertical");
  assert.equal(handle.getAttribute("aria-valuenow"), "300");
  assert.equal(handle.getAttribute("aria-valuemin"), "200");
  assert.equal(handle.getAttribute("aria-valuemax"), "360");
  assert.equal(handle.tabIndex, 0);

  assert.equal(await press(handle, "ArrowRight"), true);
  assert.deepEqual(onValueChange.mock.calls.at(-1)?.arguments, [316]);
  assert.deepEqual(onValueCommit.mock.calls.at(-1)?.arguments, [316]);
  await press(handle, "ArrowLeft");
  assert.deepEqual(onValueChange.mock.calls.at(-1)?.arguments, [284]);
  await press(handle, "Home");
  assert.deepEqual(onValueChange.mock.calls.at(-1)?.arguments, [200]);
  await press(handle, "End");
  assert.deepEqual(onValueChange.mock.calls.at(-1)?.arguments, [360]);
  // Up and down belong to a horizontal handle.
  assert.equal(await press(handle, "ArrowDown"), false);

  await act(async () => void handle.dispatchEvent(new MouseEvent("dblclick", { bubbles: true })));
  assert.equal(onReset.mock.callCount(), 1);

  // A handle on the far side of its pane, and a height the layout decides, measured when the key comes.
  await rerender(
    <ResizeHandle
      label="Resize the body"
      orientation="horizontal"
      reverse
      value={null}
      min={120}
      measure={() => 240}
      step={24}
      onValueChange={onValueChange}
    />,
  );
  assert.equal(handle.hasAttribute("aria-valuenow"), false);
  assert.equal(handle.hasAttribute("aria-valuemax"), false);
  await press(handle, "ArrowDown");
  assert.deepEqual(onValueChange.mock.calls.at(-1)?.arguments, [216]);
  // No limit, so End has nowhere to go.
  assert.equal(await press(handle, "End"), false);
});

test("a ResizeHandle follows a drag from where it started, and commits once at the end", async () => {
  function Pane() {
    const [width, setWidth] = useState<number | null>(null);
    return (
      <ResizeHandle
        label="Resize"
        value={width}
        min={100}
        max={() => 400}
        measure={() => 250}
        onValueChange={setWidth}
        onValueCommit={commit}
        onDraggingChange={dragging}
      />
    );
  }
  const commit = mock.fn();
  const dragging = mock.fn();
  await mount(<Pane />);
  const handle = document.querySelector<HTMLElement>('[role="separator"]')!;
  const pointer = (type: string, clientX: number) =>
    act(async () => {
      handle.dispatchEvent(
        new PointerEvent(type, { bubbles: true, cancelable: true, button: 0, pointerId: 1, clientX }),
      );
    });
  await pointer("pointerdown", 500);
  assert.equal(handle.dataset.dragging, "");
  assert.deepEqual(dragging.mock.calls[0]?.arguments, [true]);
  await pointer("pointermove", 530);
  assert.equal(handle.getAttribute("aria-valuenow"), "280");
  await pointer("pointermove", 900);
  assert.equal(handle.getAttribute("aria-valuenow"), "400", "stops at max");
  assert.equal(commit.mock.callCount(), 0);
  await pointer("pointerup", 900);
  assert.equal(handle.hasAttribute("data-dragging"), false);
  assert.deepEqual(
    commit.mock.calls.map(({ arguments: [value] }) => value),
    [400],
  );
  assert.deepEqual(dragging.mock.calls.at(-1)?.arguments, [false]);
});

test("a Toc marks the section being read with aria-current=location as the page scrolls", async () => {
  const onCurrentChange = mock.fn();
  const tops: Record<string, number> = { setup: 500, records: 900, verify: 1400 };
  const page = document.documentElement;
  Object.defineProperty(page, "scrollHeight", { configurable: true, value: 5000 });
  await mount(
    <>
      <Toc label="On this page" onCurrentChange={onCurrentChange}>
        <TocList>
          <TocLink href="#setup">Set up</TocLink>
          <TocLink href="#records" level={2}>
            Records
          </TocLink>
          <TocLink href="#verify">Verify</TocLink>
        </TocList>
      </Toc>
      {Object.keys(tops).map((id) => (
        <h2
          key={id}
          id={id}
          ref={(node) => void (node && (node.getBoundingClientRect = () => ({ top: tops[id] }) as DOMRect))}
        />
      ))}
    </>,
  );
  const nav = document.querySelector("nav")!;
  assert.equal(nav.getAttribute("aria-label"), "On this page");
  const current = () => document.querySelector('a[aria-current="location"]')?.textContent ?? null;
  // Before the first heading, nothing is current.
  assert.equal(current(), null);

  tops.setup = -200;
  tops.records = 20;
  await act(async () => void window.dispatchEvent(new Event("scroll")));
  await tick(30);
  assert.equal(current(), "Records");
  assert.deepEqual(onCurrentChange.mock.calls.at(-1)?.arguments, ["records"]);

  // At the very bottom the last section is current, even though its heading never reached the top.
  Object.defineProperty(page, "scrollHeight", { configurable: true, value: 700 });
  await act(async () => void window.dispatchEvent(new Event("scroll")));
  await tick(30);
  assert.equal(current(), "Verify");
  delete (page as { scrollHeight?: number }).scrollHeight;
});

test("a LanguagePicker opens the languages with the current one checked, each in its own language", async () => {
  const onValueChange = mock.fn();
  await mount(
    <LanguagePicker
      label="Language: English"
      value="en"
      onValueChange={onValueChange}
      showValue
      options={[
        { value: "auto", label: "Follow the browser" },
        { value: "en", label: "English", lang: "en" },
        { value: "zh", label: "中文", lang: "zh-CN" },
      ]}
    />,
  );
  const trigger = named("Language: English");
  assert.equal(trigger.querySelector("span[lang]")?.textContent, "English");
  await press(trigger, "Enter");
  const items = [...document.querySelectorAll<HTMLElement>('[role="menuitemradio"]')];
  assert.deepEqual(
    items.map((item) => [item.textContent, item.getAttribute("lang"), item.getAttribute("aria-checked")]),
    [
      ["Follow the browser", null, "false"],
      ["English", "en", "true"],
      ["中文", "zh-CN", "false"],
    ],
  );
  await click(items[2]!);
  assert.deepEqual(onValueChange.mock.calls[0]?.arguments, ["zh"]);
});

test("a LanguagePicker with a page per language offers links with hreflang, the current one marked", async () => {
  await mount(
    <LanguagePicker
      label="Language"
      value="zh"
      options={[
        { value: "en", label: "English", lang: "en", href: "/en/docs" },
        { value: "zh", label: "中文", lang: "zh-CN", href: "/docs" },
      ]}
    />,
  );
  await press(named("Language"), "Enter");
  const links = [...document.querySelectorAll<HTMLAnchorElement>('a[role="menuitem"]')];
  assert.deepEqual(
    links.map((link) => [link.getAttribute("href"), link.hreflang, link.lang, link.getAttribute("aria-current")]),
    [
      ["/en/docs", "en", "en", null],
      ["/docs", "zh-CN", "zh-CN", "true"],
    ],
  );
});

test("a ThemePicker shows the painted theme's icon until the preference is known, and can carry a tooltip", async () => {
  const labels = { system: "System", light: "Light", dark: "Dark" };
  const { rerender } = await mount(
    <ThemePicker value={undefined} onValueChange={() => {}} labels={labels} label="Theme" tooltip="Theme" />,
  );
  const button = named("Theme");
  // Both are drawn, and the stylesheet shows the one for the theme on screen.
  assert.ok(button.querySelector('[data-slot="theme-picker-light"].dark\\:hidden'));
  assert.ok(button.querySelector('[data-slot="theme-picker-dark"].dark\\:block'));
  assert.equal(button.getAttribute("data-slot"), "tooltip-trigger");

  await rerender(<ThemePicker value="system" onValueChange={() => {}} labels={labels} label="Theme" />);
  assert.equal(named("Theme").querySelectorAll("svg").length, 1);
  assert.ok(named("Theme").querySelector(".lucide-monitor"));
});

test("Tabs with the pill look keep the tab keyboard and mark the current tab", async () => {
  await mount(
    <Tabs defaultValue="profile">
      <TabsList variant="pill" aria-label="Mailbox settings">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="storage">Storage</TabsTrigger>
      </TabsList>
    </Tabs>,
  );
  const list = document.querySelector<HTMLElement>('[role="tablist"]')!;
  assert.equal(list.dataset.variant, "pill");
  assert.match(list.className, /gap-2/);
  assert.doesNotMatch(list.className, /border-b/);
  const [profile, storage] = [...list.querySelectorAll<HTMLElement>('[role="tab"]')];
  assert.match(profile!.className, /data-\[state=active\]:bg-highlight/);
  await act(async () => profile!.focus());
  await press(profile!, "ArrowRight");
  assert.equal(storage!.getAttribute("aria-selected"), "true");
});

test("a ScrollArea strip turns a vertical wheel sideways until an end, and fades the edges with more content", async () => {
  await mount(
    <ScrollArea aria-label="Filters" strip fade>
      <div className="flex">filters</div>
    </ScrollArea>,
  );
  const viewport = document.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')!;
  assert.equal(document.querySelector('[data-slot="scroll-area"]')?.hasAttribute("data-strip"), true);
  assert.equal(document.querySelectorAll('[data-slot="scroll-area-scrollbar"]').length <= 1, true);
  Object.defineProperty(viewport, "scrollWidth", { configurable: true, value: 300 });
  Object.defineProperty(viewport, "clientWidth", { configurable: true, value: 100 });
  const wheel = (deltaY: number, deltaX = 0) => {
    const event = new WheelEvent("wheel", { deltaY, deltaX, bubbles: true, cancelable: true });
    viewport.dispatchEvent(event);
    return event.defaultPrevented;
  };
  assert.equal(wheel(40), true);
  assert.equal(viewport.scrollLeft, 40);
  // A trackpad's own sideways scroll, and the wheel past the start, are left to the browser.
  assert.equal(wheel(5, 30), false);
  viewport.scrollLeft = 0;
  assert.equal(wheel(-40), false);

  viewport.scrollLeft = 50;
  await act(async () => void viewport.dispatchEvent(new Event("scroll")));
  await tick(30);
  assert.match(
    viewport.style.maskImage,
    /linear-gradient\(to right, transparent, #000 24px, #000 calc\(100% - 24px\), transparent\)/,
  );
});

/** A strip whose viewport is 100px wide over 300px of content, and a wheel turn on it. */
async function strip(direction: "ltr" | "rtl") {
  await mount(
    <ScrollArea aria-label="Filters" strip fade>
      <div className="flex">filters</div>
    </ScrollArea>,
  );
  const viewport = document.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')!;
  viewport.style.direction = direction;
  viewport.style.lineHeight = "20px";
  Object.defineProperty(viewport, "scrollWidth", { configurable: true, value: 300 });
  Object.defineProperty(viewport, "clientWidth", { configurable: true, value: 100 });
  const wheel = (deltaY: number, deltaMode = 0) => {
    const event = new WheelEvent("wheel", { deltaY, deltaMode, bubbles: true, cancelable: true });
    viewport.dispatchEvent(event);
    return event.defaultPrevented;
  };
  const mask = async () => {
    await act(async () => void viewport.dispatchEvent(new Event("scroll")));
    await tick(30);
    return viewport.style.maskImage;
  };
  return { viewport, wheel, mask };
}

test("a right-to-left ScrollArea strip scrolls toward its end on the left, and fades the edge that hides content", async () => {
  const { viewport, wheel, mask } = await strip("rtl");
  // At the start, on the right: all the hidden content is to the left.
  assert.equal(await mask(), "linear-gradient(to right, transparent, #000 24px, #000)");
  assert.equal(wheel(-40), false, "the start lets the page scroll");
  assert.equal(wheel(40), true);
  assert.equal(viewport.scrollLeft, -40);
  assert.match(
    await mask(),
    /^linear-gradient\(to right, transparent, #000 24px, #000 calc\(100% - 24px\), transparent\)$/,
  );
  viewport.scrollLeft = -200;
  assert.equal(await mask(), "linear-gradient(to right, #000, #000 calc(100% - 24px), transparent)");
  assert.equal(wheel(40), false, "the end lets the page scroll");
});

test("a ScrollArea strip turns a wheel that counts lines or pages into pixels", async () => {
  const { viewport, wheel } = await strip("ltr");
  assert.equal(wheel(3, 1), true);
  assert.equal(viewport.scrollLeft, 60, "three lines of 20px");
  assert.equal(wheel(1, 2), true);
  assert.equal(viewport.scrollLeft, 160, "a page is the row's width");
});

test("scrollIntoRow centres a tab measured on screen, so a right-to-left row scrolls the right way", () => {
  const row = document.createElement("div");
  const item = document.createElement("a");
  const scrollTo = mock.fn();
  Object.defineProperty(row, "clientWidth", { value: 100 });
  Object.defineProperty(row, "scrollLeft", { value: -50 });
  Object.assign(row, { scrollTo });
  row.getBoundingClientRect = () => ({ left: 0, width: 100, right: 100 }) as DOMRect;
  // A tab past the left edge of a row scrolled 50px from its start on the right.
  item.getBoundingClientRect = () => ({ left: -60, width: 40, right: -20 }) as DOMRect;
  scrollIntoRow(row, item);
  assert.deepEqual(scrollTo.mock.calls[0]?.arguments, [{ left: -140, behavior: "auto" }]);
});
