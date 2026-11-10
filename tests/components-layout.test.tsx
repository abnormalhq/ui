// The browser environment has to come first: see support/dom.ts.
import { click, render } from "./support/render.tsx";
import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { act, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const press = async (element: Element, key: string) => {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  await act(async () => {
    element.dispatchEvent(event);
    // Radix moves roving focus a tick after the key.
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return event.defaultPrevented;
};
const focused = () => document.activeElement?.textContent;

const tabs = (props: React.ComponentProps<typeof Tabs> = {}) => (
  <Tabs defaultValue="general" {...props}>
    <TabsList aria-label="Domain settings">
      <TabsTrigger value="general">General</TabsTrigger>
      <TabsTrigger value="dns">DNS</TabsTrigger>
      <TabsTrigger value="billing" disabled>
        Billing
      </TabsTrigger>
      <TabsTrigger value="members">Members</TabsTrigger>
    </TabsList>
    <TabsContent value="general">Verified</TabsContent>
    <TabsContent value="dns">Four records</TabsContent>
    <TabsContent value="billing">Invoices</TabsContent>
    <TabsContent value="members">Twelve people</TabsContent>
  </Tabs>
);
const tab = (name: string) =>
  [...document.querySelectorAll<HTMLElement>('[role="tab"]')].find((element) => element.textContent === name)!;
const shownPanel = () => document.querySelector('[role="tabpanel"]:not([hidden])');

test("Tabs tie each tab to its panel, and keep one tab in the tab order", async () => {
  await mount(tabs());
  const list = document.querySelector('[role="tablist"]')!;
  assert.equal(list.getAttribute("aria-label"), "Domain settings");
  assert.equal(list.getAttribute("aria-orientation"), "horizontal");
  assert.equal(list.querySelectorAll('[role="tab"]').length, 4);

  const panel = shownPanel()!;
  assert.equal(panel.textContent, "Verified");
  assert.equal(tab("General").getAttribute("aria-selected"), "true");
  assert.equal(tab("DNS").getAttribute("aria-selected"), "false");
  assert.equal(tab("General").getAttribute("aria-controls"), panel.id);
  assert.equal(panel.getAttribute("aria-labelledby"), tab("General").id);
  // A panel is a tab stop, so text with no control in it can be reached.
  assert.equal(panel.getAttribute("tabindex"), "0");
  assert.equal((tab("Billing") as HTMLButtonElement).disabled, true);
});

test("arrow keys move between tabs and open them, past a disabled tab and around the ends", async () => {
  const onValueChange = mock.fn();
  await mount(tabs({ onValueChange }));
  await act(async () => tab("General").focus());

  assert.equal(await press(tab("General"), "ArrowRight"), true);
  assert.equal(focused(), "DNS");
  assert.equal(tab("DNS").getAttribute("aria-selected"), "true");
  assert.equal(shownPanel()!.textContent, "Four records");
  // Roving tabindex: only the current tab is a tab stop.
  assert.deepEqual(
    [...document.querySelectorAll<HTMLElement>('[role="tab"]:not(:disabled)')].map(({ tabIndex }) => tabIndex),
    [-1, 0, -1],
  );

  await press(tab("DNS"), "ArrowRight");
  assert.equal(focused(), "Members", "Billing is disabled");
  await press(tab("Members"), "ArrowRight");
  assert.equal(focused(), "General", "wraps to the first");
  await press(tab("General"), "ArrowLeft");
  assert.equal(focused(), "Members");
  await press(tab("Members"), "Home");
  assert.equal(focused(), "General");
  await press(tab("General"), "End");
  assert.equal(focused(), "Members");
  assert.equal(shownPanel()!.textContent, "Twelve people");
  assert.deepEqual(onValueChange.mock.calls.at(-1)?.arguments, ["members"]);
});

test("manual Tabs move focus with the arrows and open on a click only", async () => {
  await mount(tabs({ activationMode: "manual" }));
  await act(async () => tab("General").focus());
  await press(tab("General"), "ArrowRight");
  assert.equal(focused(), "DNS");
  assert.equal(shownPanel()!.textContent, "Verified");
  await act(async () => {
    tab("DNS").dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0 }));
  });
  assert.equal(shownPanel()!.textContent, "Four records");
});

const accordion = (props: React.ComponentProps<typeof Accordion>) => (
  <Accordion {...props}>
    <AccordionItem value="forwarding">
      <AccordionTrigger>Forwarding</AccordionTrigger>
      <AccordionContent>Two other mailboxes</AccordionContent>
    </AccordionItem>
    <AccordionItem value="reply" disabled>
      <AccordionTrigger heading="h4">Automatic reply</AccordionTrigger>
      <AccordionContent>Off</AccordionContent>
    </AccordionItem>
    <AccordionItem value="filters">
      <AccordionTrigger>Filters</AccordionTrigger>
      <AccordionContent>Three rules</AccordionContent>
    </AccordionItem>
  </Accordion>
);
const header = (name: string) =>
  [...document.querySelectorAll<HTMLButtonElement>('[data-slot="accordion-trigger"]')].find(
    (element) => element.textContent === name,
  )!;
const expanded = () =>
  [...document.querySelectorAll('[data-slot="accordion-trigger"][aria-expanded="true"]')].map(
    ({ textContent }) => textContent,
  );

test("an Accordion's headers are headings with buttons that name the regions they open", async () => {
  await mount(accordion({ type: "single", collapsible: true, defaultValue: "forwarding" }));
  assert.equal(header("Forwarding").parentElement!.tagName, "H3");
  assert.equal(header("Automatic reply").parentElement!.tagName, "H4", "the level the page asks for");
  assert.equal(header("Forwarding").tagName, "BUTTON");
  assert.deepEqual(expanded(), ["Forwarding"]);

  const region = document.querySelector('[role="region"]:not([hidden])')!;
  assert.equal(region.textContent, "Two other mailboxes");
  assert.equal(header("Forwarding").getAttribute("aria-controls"), region.id);
  assert.equal(region.getAttribute("aria-labelledby"), header("Forwarding").id);
  assert.equal(header("Filters").getAttribute("aria-expanded"), "false");
  assert.equal(header("Automatic reply").disabled, true);
  // A closed panel is hidden from everyone, and holds nothing.
  const closed = [...document.querySelectorAll<HTMLElement>('[role="region"]')].filter(({ hidden }) => hidden);
  assert.deepEqual(
    closed.map(({ textContent }) => textContent),
    ["", ""],
  );
});

test("a single Accordion keeps one section open, and closes it again only when collapsible", async () => {
  const { rerender } = await mount(accordion({ type: "single", collapsible: true, defaultValue: "forwarding" }));
  await click(header("Filters"));
  assert.deepEqual(expanded(), ["Filters"]);
  await click(header("Filters"));
  assert.deepEqual(expanded(), []);

  await rerender(accordion({ type: "single", defaultValue: "filters" }));
  await mounted.pop()!.unmount();
  await mount(accordion({ type: "single", defaultValue: "filters" }));
  await click(header("Filters"));
  assert.deepEqual(expanded(), ["Filters"], "one always stays open");
  // The open header of such a group cannot be closed, and says so.
  assert.equal(header("Filters").getAttribute("aria-disabled"), "true");
  await mounted.pop()!.unmount();

  await mount(accordion({ type: "multiple", defaultValue: ["forwarding"] }));
  await click(header("Filters"));
  assert.deepEqual(expanded(), ["Forwarding", "Filters"]);
});

test("Up, Down, Home and End move between an Accordion's headers, skipping a disabled one", async () => {
  await mount(accordion({ type: "multiple" }));
  await act(async () => header("Forwarding").focus());
  assert.equal(await press(header("Forwarding"), "ArrowDown"), true);
  assert.equal(focused(), "Filters");
  await press(header("Filters"), "ArrowDown");
  assert.equal(focused(), "Forwarding", "wraps");
  await press(header("Forwarding"), "End");
  assert.equal(focused(), "Filters");
  await press(header("Filters"), "Home");
  assert.equal(focused(), "Forwarding");
  await press(header("Forwarding"), "ArrowUp");
  assert.equal(focused(), "Filters");
  // Moving does not open anything.
  assert.deepEqual(expanded(), []);
});

test("a Collapsible's trigger says whether its region is open, and the page can hold the state", async () => {
  const onOpenChange = mock.fn();
  function Advanced() {
    const [open, setOpen] = useState(false);
    return (
      <Collapsible
        open={open}
        onOpenChange={(next) => {
          onOpenChange(next);
          setOpen(next);
        }}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost">Advanced</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>Port 993</CollapsibleContent>
        <button type="button" onClick={() => setOpen(false)}>
          Reset
        </button>
      </Collapsible>
    );
  }
  await mount(<Advanced />);
  const trigger = [...document.querySelectorAll("button")].find(({ textContent }) => textContent === "Advanced")!;
  const content = () => document.querySelector<HTMLElement>('[data-slot="collapsible-content"]')!;
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  assert.equal(content().hidden, true);
  assert.equal(content().textContent, "");

  await click(trigger);
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.equal(trigger.getAttribute("aria-controls"), content().id);
  assert.equal(content().hidden, false);
  assert.equal(content().textContent, "Port 993");
  assert.deepEqual(
    onOpenChange.mock.calls.map(({ arguments: args }) => args),
    [[true]],
  );

  // Closed from elsewhere on the page.
  await click([...document.querySelectorAll("button")].find(({ textContent }) => textContent === "Reset")!);
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  assert.equal(content().hidden, true);
});

test("an Avatar shows its picture once loaded, and keeps the initials when it cannot load", async () => {
  const avatar = (src?: string) => (
    <Avatar>
      <AvatarImage src={src} alt="Ada King" />
      <AvatarFallback>AK</AvatarFallback>
    </Avatar>
  );
  // A picture still on its way, as a browser reports it (happy-dom loads nothing, and calls that complete).
  mock.getter(HTMLImageElement.prototype, "complete", () => false);
  const { container, rerender } = await mount(avatar("/ada.png"));
  const image = () => container.querySelector("img");
  const fallback = () => container.querySelector('[data-slot="avatar-fallback"]');
  // On its way: both are there, and only the picture's alt speaks.
  assert.equal(image()!.getAttribute("alt"), "Ada King");
  assert.equal(fallback()!.textContent, "AK");
  assert.equal(fallback()!.getAttribute("aria-hidden"), "true");
  // The component never fetches: the only request is the <img> the page asked for.
  assert.equal(image()!.getAttribute("src"), "/ada.png");

  await act(async () => void image()!.dispatchEvent(new Event("load")));
  assert.ok(image());
  assert.equal(fallback(), null);

  await rerender(avatar("/gone.png"));
  await act(async () => void image()!.dispatchEvent(new Event("error")));
  assert.equal(image(), null);
  assert.equal(fallback()!.textContent, "AK");
  assert.equal(fallback()!.getAttribute("aria-hidden"), null);

  // A new address gets a new try; none at all is just the initials.
  await rerender(avatar("/ada-2.png"));
  assert.equal(image()!.getAttribute("src"), "/ada-2.png");
  await rerender(avatar());
  assert.equal(image(), null);
  assert.equal(fallback()!.getAttribute("aria-hidden"), null);
});

test("an Avatar whose picture failed before React attached keeps the initials", async () => {
  // A server-rendered <img> can finish, either way, before hydration: complete, with no pixels.
  mock.getter(HTMLImageElement.prototype, "complete", () => true);
  mock.getter(HTMLImageElement.prototype, "naturalWidth", () => 0);
  const { container } = await mount(
    <Avatar>
      <AvatarImage src="/gone.png" alt="Ada King" />
      <AvatarFallback>AK</AvatarFallback>
    </Avatar>,
  );
  assert.equal(container.querySelector("img"), null);
  assert.equal(container.querySelector('[data-slot="avatar-fallback"]')!.textContent, "AK");
});

test("a ScrollArea's viewport is a tab stop only while it scrolls, and a region when named", async () => {
  const area = (label?: string) => (
    <ScrollArea aria-label={label} className="h-40">
      <p>Inbox</p>
    </ScrollArea>
  );
  const { container, rerender } = await mount(area());
  const viewport = container.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')!;
  const layout = { clientHeight: 160, scrollHeight: 160, clientWidth: 200, scrollWidth: 200 };
  for (const key of Object.keys(layout) as (keyof typeof layout)[]) {
    Object.defineProperty(viewport, key, { configurable: true, get: () => layout[key] });
  }
  const scroll = () => act(async () => void viewport.dispatchEvent(new Event("scroll")));

  await scroll();
  assert.equal(viewport.getAttribute("tabindex"), null, "content that fits adds no tab stop");
  assert.equal(viewport.getAttribute("role"), null);

  layout.scrollHeight = 900;
  await scroll();
  assert.equal(viewport.getAttribute("tabindex"), "0");
  // No name was given, and the component has no words of its own to make one from.
  assert.equal(viewport.getAttribute("role"), null);

  await rerender(area("Folders"));
  assert.equal(viewport.getAttribute("role"), "region");
  assert.equal(viewport.getAttribute("aria-label"), "Folders");
  assert.equal(container.querySelector('[data-slot="scroll-area"]')!.getAttribute("aria-label"), null);
});

test("an Avatar given only a srcSet shows that picture", async () => {
  mock.getter(HTMLImageElement.prototype, "complete", () => false);
  const { container } = await mount(
    <Avatar>
      <AvatarImage srcSet="/ada.png 1x, /ada@2x.png 2x" alt="Ada King" />
      <AvatarFallback>AK</AvatarFallback>
    </Avatar>,
  );
  const image = container.querySelector("img");
  assert.equal(image?.getAttribute("srcset"), "/ada.png 1x, /ada@2x.png 2x");
  await act(async () => void image!.dispatchEvent(new Event("load")));
  assert.equal(container.querySelector('[data-slot="avatar-fallback"]'), null);
});
