/*
 * The items added for the app shell and its forms, rendered the way a Server Component page would, with no DOM:
 * what a page gets before any client code runs.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { FileButton } from "@/components/ui/file-button";
import { JsonLd, serializeJsonLd } from "@/components/ui/json-ld";
import { NavTab, NavTabs } from "@/components/ui/nav-tabs";
import { PasswordInput } from "@/components/ui/password-input";
import { Sidebar, SidebarItem, SidebarNav } from "@/components/ui/sidebar";
import { ThemePicker } from "@/components/ui/theme-picker";
import { Toc, TocLink, TocList } from "@/components/ui/toc";
import { Turnstile } from "@/components/ui/turnstile";

test("JsonLd writes its data as JSON that cannot end the script element", () => {
  const data = { "@type": "Organization", name: "a </script><script>alert(1)</script> <!-- b" };
  const html = renderToStaticMarkup(<JsonLd data={data} />);
  assert.match(html, /^<script type="application\/ld\+json" data-slot="json-ld">/);
  assert.equal(html.match(/<\/script>/g)?.length, 1, "only the element's own end tag");
  assert.doesNotMatch(html, /<!--/);
  const text = html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
  assert.deepEqual(JSON.parse(text), data);
  assert.equal(serializeJsonLd(["<"]), '["\\u003c"]');
});

test("NavTabs and a Toc are links in the server markup, the current tab marked before any script", () => {
  const tabs = renderToStaticMarkup(
    <NavTabs label="Period" variant="segmented">
      <NavTab href="?range=7d">7 days</NavTab>
      <NavTab href="?range=30d" current>
        30 days
      </NavTab>
    </NavTabs>,
  );
  assert.match(tabs, /^<nav data-slot="nav-tabs" data-variant="segmented" aria-label="Period"/);
  assert.match(tabs, /<a data-slot="nav-tab" aria-current="page"[^>]*href="\?range=30d">30 days<\/a>/);
  assert.equal(tabs.match(/aria-current/g)?.length, 1);

  const toc = renderToStaticMarkup(
    <Toc label="On this page">
      <TocList>
        <TocLink href="#setup">Set up</TocLink>
      </TocList>
    </Toc>,
  );
  assert.match(toc, /^<nav data-slot="toc" aria-label="On this page"/);
  assert.match(toc, /<ol[^>]*><li[^>]*><a[^>]*href="#setup">Set up<\/a><\/li><\/ol>/);
  // The mark is the script's: nothing is current in the markup.
  assert.doesNotMatch(toc, /aria-current/);
});

test("a Sidebar renders the state the server read, rows and names included", () => {
  const html = renderToStaticMarkup(
    <Sidebar defaultCollapsed>
      <SidebarNav label="Main">
        <SidebarItem icon={<svg />} label="Inbox" count={3} current />
      </SidebarNav>
    </Sidebar>,
  );
  assert.match(html, /^<aside data-slot="sidebar" data-state="collapsed"/);
  assert.match(html, /<nav data-slot="sidebar-nav" aria-label="Main"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /<span data-slot="sidebar-item-label" class="sr-only">Inbox<\/span>/);
});

test("a ThemePicker that does not know the preference draws both theme icons for the stylesheet to choose", () => {
  const labels = { system: "System", light: "Light", dark: "Dark" };
  const unknown = renderToStaticMarkup(
    <ThemePicker value={undefined} onValueChange={() => {}} labels={labels} label="Theme" />,
  );
  assert.match(unknown, /<svg[^>]*class="lucide lucide-sun dark:hidden"[^>]*data-slot="theme-picker-light"/);
  assert.match(unknown, /<svg[^>]*class="lucide lucide-moon hidden dark:block"[^>]*data-slot="theme-picker-dark"/);
  assert.doesNotMatch(unknown, /lucide-monitor/);
  const known = renderToStaticMarkup(
    <ThemePicker value="dark" onValueChange={() => {}} labels={labels} label="Theme" />,
  );
  assert.equal(known.match(/<svg/g)?.length, 1);
});

test("the form fields render the inputs a form submits before any script runs", () => {
  const moment = renderToStaticMarkup(
    <DateTimePicker
      locale="en-GB"
      name="start"
      defaultValue="2026-11-18T22:00"
      placeholder="Choose a date"
      calendarLabel="Choose the start"
      previousLabel="Previous month"
      nextLabel="Next month"
      timeLabel="Start time"
    />,
  );
  assert.match(moment, /<input type="hidden" name="start" value="2026-11-18T22:00"\/>/);
  assert.match(moment, /<input[^>]*type="time"[^>]*aria-label="Start time"[^>]*value="22:00"/);
  assert.match(moment, />18 Nov 2026</);

  const password = renderToStaticMarkup(
    <PasswordInput name="password" showLabel="Show password" hideLabel="Hide password" />,
  );
  assert.match(password, /<input[^>]*type="password"[^>]*name="password"/);
  assert.match(password, /<button type="button"[^>]*aria-label="Show password"/);

  const file = renderToStaticMarkup(<FileButton name="avatar">Upload</FileButton>);
  assert.match(file, /<button[^>]*type="button"[^>]*>Upload<\/button><input type="file" hidden=""/);
  assert.match(file, /name="avatar"/);

  assert.equal(renderToStaticMarkup(<Turnstile siteKey={null} />), "");
  assert.equal(
    renderToStaticMarkup(<Turnstile siteKey="key" />),
    '<div data-slot="turnstile" class="max-w-full"></div>',
  );
});
