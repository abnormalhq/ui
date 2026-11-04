/*
 * Renders items the way a Server Component page would, with no DOM: what a server-rendered page of a project gets
 * before any client code runs.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { rowActionClassName } from "@/components/ui/table-row";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

test("a Tooltip renders without a TooltipProvider", () => {
  const html = renderToStaticMarkup(
    <Tooltip>
      <TooltipTrigger>Info</TooltipTrigger>
      <TooltipContent>Archived after 30 days</TooltipContent>
    </Tooltip>,
  );
  assert.match(html, /data-slot="tooltip-trigger"[^>]*>Info</);
});

test("CardTitle is an h2 unless the page asks for another level", () => {
  assert.match(renderToStaticMarkup(<CardTitle>Storage</CardTitle>), /^<h2 data-slot="card-title"/);
  const html = renderToStaticMarkup(
    <CardTitle asChild className="text-base">
      <h3>Storage</h3>
    </CardTitle>,
  );
  assert.match(html, /^<h3 data-slot="card-title" class="[^"]*text-base[^"]*">Storage<\/h3>$/);
});

test("a named Switch renders the input a form submits while it is on", () => {
  const html = renderToStaticMarkup(<Switch name="digest" defaultChecked aria-label="Weekly digest" />);
  // One element, so sibling selectors and space-x-* see the same markup with or without a name.
  assert.match(
    html,
    /^<button[^>]*role="switch"[^>]*aria-checked="true"[^>]*><span[^>]*><\/span><input type="hidden" name="digest" value="on"\/><\/button>$/,
  );
  assert.match(html, /<button[^>]*class="peer /);
  for (const off of [
    <Switch key="unnamed" defaultChecked aria-label="No name" />,
    <Switch key="off" name="digest" aria-label="Off" />,
    <Switch key="disabled" name="digest" defaultChecked disabled aria-label="Disabled" />,
  ]) {
    assert.doesNotMatch(renderToStaticMarkup(off), /<input/);
  }
});

test("the row action class reaches markup rendered on the server", () => {
  const html = renderToStaticMarkup(<Button className={rowActionClassName}>More</Button>);
  assert.match(html, /group-hover\/row:opacity-100/);
});
