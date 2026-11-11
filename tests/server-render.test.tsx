/*
 * Renders items the way a Server Component page would, with no DOM: what a server-rendered page of a project gets
 * before any client code runs.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Alert } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DatePicker } from "@/components/ui/date-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { InputOTP } from "@/components/ui/input-otp";
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PricingCard, PricingCardFeature, PricingCardFeatures } from "@/components/ui/pricing-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Stepper, StepperContent, StepperIndicator, StepperItem, StepperTitle } from "@/components/ui/stepper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

test("a loading Button is disabled, busy and led by a spinner, with asChild too", () => {
  const html = renderToStaticMarkup(<Button loading>Saving</Button>);
  assert.match(
    html,
    /^<button[^>]*aria-busy="true"[^>]*disabled=""[^>]*><span[^>]*data-slot="spinner"[^>]*><\/span>Saving<\/button>$/,
  );
  const link = renderToStaticMarkup(
    <Button asChild loading>
      <a href="/next">Continue</a>
    </Button>,
  );
  assert.match(
    link,
    /^<a href="\/next"[^>]*aria-busy="true"[^>]*><span[^>]*data-slot="spinner"[^>]*><\/span>Continue<\/a>$/,
  );
  assert.match(link, /aria-disabled="true"/);
  assert.doesNotMatch(renderToStaticMarkup(<Button>Save</Button>), /data-slot="spinner"|aria-busy="true"/);
});

test("a loading AlertDialogAction is disabled even though the child sets disabled itself", () => {
  const html = renderToStaticMarkup(
    <AlertDialog open>
      <AlertDialogAction loading disabled={false}>
        Delete
      </AlertDialogAction>
    </AlertDialog>,
  );
  assert.match(html, /<button[^>]*disabled=""[^>]*>/);
  assert.match(html, /<button[^>]*aria-busy="true"[^>]*>/);
});

test("only a destructive Alert interrupts; the others are a status, and a given role wins", () => {
  const role = (ui: React.ReactElement) => renderToStaticMarkup(ui).match(/role="([^"]+)"/)?.[1];
  assert.equal(role(<Alert>Maintenance on Sunday</Alert>), "status");
  assert.equal(role(<Alert variant="success">Domain verified</Alert>), "status");
  assert.equal(role(<Alert variant="destructive">Payment failed</Alert>), "alert");
  assert.equal(role(<Alert role="alert">Sending is paused</Alert>), "alert");
  assert.equal(
    role(
      <Alert variant="destructive" role="status">
        Card declined
      </Alert>,
    ),
    "status",
  );
});

test("the row action class reaches markup rendered on the server", () => {
  const html = renderToStaticMarkup(<Button className={rowActionClassName}>More</Button>);
  assert.match(html, /group-hover\/row:opacity-100/);
});

/** The opening tags of a kind of element, to read attributes off. */
const tags = (html: string, name: string) =>
  [...html.matchAll(new RegExp(`<${name}(?:\\s[^>]*)?>`, "g"))].map(([tag]) => tag);

test("a Breadcrumb is a named landmark with an ordered trail that ends on the current page", () => {
  const html = renderToStaticMarkup(
    <Breadcrumb label="Fil d'Ariane">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis label="Autres niveaux" />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <a href="/admin/domains" data-router="">
              Domains
            </a>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>example.com</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>,
  );
  assert.match(html, /^<nav data-slot="breadcrumb" aria-label="Fil d&#x27;Ariane"><ol /);
  assert.equal(tags(html, "li").length, 7);
  // The chevrons are decoration: three separators, each hidden.
  const separators = tags(html, "li").filter((tag) => tag.includes('data-slot="breadcrumb-separator"'));
  assert.equal(separators.length, 3);
  for (const tag of separators) assert.match(tag, /role="presentation" aria-hidden="true"/);
  // The page itself is text marked current, not a link; the router's link keeps its own props.
  assert.match(html, /<span data-slot="breadcrumb-page" aria-current="page"[^>]*>example\.com<\/span>/);
  assert.equal((html.match(/aria-current/g) ?? []).length, 1);
  assert.equal(tags(html, "a").length, 2);
  assert.match(html, /<a href="\/admin\/domains" data-router="" data-slot="breadcrumb-link"/);
  assert.match(html, /<svg[^>]*aria-hidden="true"[^>]*>.*?<\/svg><span class="sr-only">Autres niveaux<\/span>/);
});

test("Pagination is a named landmark of links, with the current page marked and a dead end dimmed", () => {
  const html = renderToStaticMarkup(
    <Pagination label="Pagination">
      <PaginationList>
        <PaginationItem>
          <PaginationPrevious href="/mail?page=0" disabled>
            Previous
          </PaginationPrevious>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/mail?page=1" current aria-label="Page 1">
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="/mail?page=2" aria-label="Page 2">
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis label="More pages" />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext asChild>
            <a href="/mail?page=2" data-router="">
              Next
            </a>
          </PaginationNext>
        </PaginationItem>
      </PaginationList>
    </Pagination>,
  );
  assert.match(html, /^<nav data-slot="pagination" aria-label="Pagination"[^>]*><ul /);
  const links = tags(html, "a");
  assert.equal(links.length, 4);
  const [previous, first, second, next] = links as [string, string, string, string];
  // Previous on the first page: still announced as a link, dimmed, with nowhere to go and out of the tab order.
  assert.match(previous, /role="link"/);
  assert.match(previous, /aria-disabled="true"/);
  assert.doesNotMatch(previous, /href=/);
  assert.match(first, /aria-current="page"/);
  assert.match(first, /href="\/mail\?page=1"/);
  assert.match(first, /aria-label="Page 1"/);
  assert.doesNotMatch(second, /aria-current/);
  assert.match(next, /^<a href="\/mail\?page=2" data-router="" data-slot="pagination-next"/);
  assert.match(html, /<span class="sr-only">More pages<\/span>/);

  // Under asChild a disabled link drops the router's link and keeps its words.
  const disabled = renderToStaticMarkup(
    <PaginationNext asChild disabled>
      <a href="/mail?page=9">Next</a>
    </PaginationNext>,
  );
  assert.equal(tags(disabled, "a").length, 1);
  assert.match(disabled, /^<a data-slot="pagination-next" role="link" aria-disabled="true"[^>]*>Next<\/a>$/);
});

test("a Stepper is an ordered list with one current step, and says a finished step is finished", () => {
  const html = renderToStaticMarkup(
    <Stepper aria-label="Checkout">
      <StepperItem status="complete" statusLabel="Completed">
        <StepperIndicator>1</StepperIndicator>
        <StepperContent>
          <StepperTitle>Cart</StepperTitle>
        </StepperContent>
      </StepperItem>
      <StepperItem status="current">
        <StepperIndicator>2</StepperIndicator>
        <StepperContent>
          <StepperTitle>Payment</StepperTitle>
        </StepperContent>
      </StepperItem>
      <StepperItem status="upcoming">
        <StepperIndicator>3</StepperIndicator>
        <StepperContent>
          <StepperTitle>Review</StepperTitle>
        </StepperContent>
      </StepperItem>
    </Stepper>,
  );
  assert.match(html, /^<ol data-slot="stepper" data-orientation="horizontal"[^>]*aria-label="Checkout">/);
  const items = tags(html, "li");
  assert.deepEqual(
    items.map((tag) => [tag.match(/data-status="(\w+)"/)?.[1], tag.match(/aria-current="(\w+)"/)?.[1]]),
    [
      ["complete", undefined],
      ["current", "step"],
      ["upcoming", undefined],
    ],
  );
  // The check is a picture; the words are the page's, once, on the finished step.
  assert.equal((html.match(/<span class="sr-only">Completed<\/span>/g) ?? []).length, 1);
  assert.equal((html.match(/data-slot="stepper-indicator" aria-hidden="true"/g) ?? []).length, 3);
  assert.match(renderToStaticMarkup(<Stepper orientation="vertical" />), /data-orientation="vertical"/);
});

test("a featured PricingCard marks its price with the highlighter, and only then", () => {
  const card = (featured: boolean) =>
    renderToStaticMarkup(
      <PricingCard
        featured={featured}
        badge={featured ? "Most popular" : undefined}
        name="Team"
        price="$9"
        period="per mailbox / month"
        heading="h2"
        action={<Button>Choose Team</Button>}
      >
        <PricingCardFeatures>
          <PricingCardFeature>50 GB per mailbox</PricingCardFeature>
        </PricingCardFeatures>
      </PricingCard>,
    );
  const featured = card(true);
  assert.match(featured, /^<section data-slot="pricing-card"[^>]*data-featured="true"/);
  assert.match(featured, /<h2 data-slot="pricing-card-name"[^>]*>Team<\/h2>/);
  assert.match(featured, /<span data-slot="marker"[^>]*>\$9<\/span>/);
  assert.match(featured, /<span data-slot="badge" data-variant="brand"[^>]*>Most popular<\/span>/);
  assert.match(featured, /per mailbox \/ month/);
  assert.match(
    featured,
    /<ul[^>]*><li[^>]*><span[^>]*aria-hidden="true">.*?<\/span><span[^>]*>50 GB per mailbox<\/span><\/li><\/ul>/,
  );
  assert.match(featured, /<button[^>]*>Choose Team<\/button>/);

  const plain = card(false);
  assert.doesNotMatch(plain, /data-slot="marker"|data-featured|data-slot="badge"/);
  assert.match(plain, />\$9</);
});

test("a Calendar given today renders the same month on the server as in the browser", () => {
  const html = renderToStaticMarkup(
    <Calendar locale="en-GB" today="2026-11-10" defaultValue="2026-11-18" previousLabel="Previous" nextLabel="Next" />,
  );
  assert.match(html, /aria-live="polite"[^>]*>November 2026</);
  assert.match(html, /<table role="grid"/);
  assert.match(html, /data-date="2026-11-10"[^>]*aria-current="date"/);
  assert.match(html, /<td role="gridcell" aria-selected="true"[^>]*><button[^>]*data-date="2026-11-18"/);
  assert.equal((html.match(/tabindex="0"/g) ?? []).length, 1);
  // Without one, the server marks no day: it cannot know the reader's today, and must not guess.
  const unknown = renderToStaticMarkup(
    <Calendar locale="en-GB" defaultMonth="2026-11" previousLabel="Previous" nextLabel="Next" />,
  );
  assert.doesNotMatch(unknown, /aria-current/);
});

test("a range Calendar and its month and year lists render on the server", () => {
  const html = renderToStaticMarkup(
    <Calendar
      mode="range"
      locale="en-GB"
      today="2026-11-10"
      defaultValue={{ from: "2026-11-12", to: "2026-11-14" }}
      previousLabel="Previous"
      nextLabel="Next"
      monthLabel="Month"
      yearLabel="Year"
    />,
  );
  assert.match(html, /<table role="grid"[^>]*aria-multiselectable="true"/);
  assert.equal((html.match(/<td role="gridcell" aria-selected="true"/g) ?? []).length, 3);
  assert.match(html, /data-date="2026-11-12"[^>]*data-selected="true"[^>]*data-range="start"/);
  assert.match(html, /data-date="2026-11-13"[^>]*data-range="middle"/);
  assert.equal((html.match(/tabindex="0"/g) ?? []).length, 1);
  // The lists are the browser's own, so they work before any script runs; the month's name stays for the grid.
  assert.match(html, /<select[^>]*aria-label="Month"[^>]*>.*<option value="11" selected="">November<\/option>/);
  assert.match(html, /<select[^>]*aria-label="Year"[^>]*>.*<option value="2026" selected="">2026<\/option>/);
  assert.match(html, /class="sr-only"[^>]*>November 2026</);

  const picker = renderToStaticMarkup(
    <DateRangePicker
      fromName="from"
      toName="to"
      locale="en-GB"
      defaultValue={{ from: "2026-11-02", to: "2026-11-10" }}
      placeholder="Choose a period"
      calendarLabel="Choose a period"
      previousLabel="Previous"
      nextLabel="Next"
    />,
  );
  assert.match(picker, /^<button type="button" role="combobox"[^>]*aria-haspopup="dialog"[^>]*aria-expanded="false"/);
  assert.match(
    picker,
    />2\s*–\s*10 Nov 2026<\/span><input type="hidden" name="from" value="2026-11-02"\/><input type="hidden" name="to" value="2026-11-10"\/><\/button>$/,
  );
});

test("the fields render their value, and the input a form submits, before any script runs", () => {
  const otp = renderToStaticMarkup(<InputOTP name="code" defaultValue="12 3" groupSize={3} aria-label="Code" />);
  assert.match(otp, /<input[^>]*autoComplete="one-time-code"[^>]*aria-label="Code" name="code" value="123"\/>/);
  assert.equal((otp.match(/data-slot="input-otp-slot"/g) ?? []).length, 6);
  assert.equal((otp.match(/data-filled="true"/g) ?? []).length, 3);
  assert.doesNotMatch(otp, /data-active=/);

  const combobox = renderToStaticMarkup(
    <Combobox
      name="region"
      defaultValue="eu"
      options={[{ value: "eu", label: "Frankfurt" }]}
      placeholder="Choose a region"
      searchLabel="Search regions"
      emptyMessage="No region matches"
    />,
  );
  assert.match(combobox, /^<button type="button" role="combobox"[^>]*aria-haspopup="dialog"[^>]*aria-expanded="false"/);
  assert.match(combobox, />Frankfurt<\/span>/);
  assert.match(combobox, /<input type="hidden" name="region" value="eu"\/><\/button>$/);

  const picker = renderToStaticMarkup(
    <DatePicker
      name="renewal"
      locale="en-GB"
      defaultValue="2026-11-18"
      placeholder="Choose a date"
      calendarLabel="Choose a date"
      previousLabel="Previous"
      nextLabel="Next"
    />,
  );
  assert.match(picker, />18 Nov 2026<\/span><input type="hidden" name="renewal" value="2026-11-18"\/><\/button>$/);

  const slider = renderToStaticMarkup(<Slider name="quota" defaultValue={[20]} aria-label="Quota" />);
  assert.match(slider, /role="slider"[^>]*aria-label="Quota"|aria-label="Quota"[^>]*role="slider"/);
  // Radix places a thumb once it has measured it in the browser; the track and the name are there before.
  assert.match(slider, /data-slot="slider-track"/);
});

test("Tabs, an Accordion and a Command render their open content on the server", () => {
  const tabs = renderToStaticMarkup(
    <Tabs defaultValue="dns">
      <TabsList aria-label="Settings">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="dns">DNS</TabsTrigger>
      </TabsList>
      <TabsContent value="general">Verified</TabsContent>
      <TabsContent value="dns">Four records</TabsContent>
    </Tabs>,
  );
  assert.match(tabs, /role="tablist"/);
  assert.match(tabs, /aria-selected="true"[^>]*>DNS</);
  assert.match(tabs, /role="tabpanel"[^>]*>Four records</);
  assert.doesNotMatch(tabs, />Verified</);

  const accordion = renderToStaticMarkup(
    <Accordion type="single" defaultValue="a">
      <AccordionItem value="a">
        <AccordionTrigger>Forwarding</AccordionTrigger>
        <AccordionContent>Two mailboxes</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Filters</AccordionTrigger>
        <AccordionContent>Three rules</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );
  assert.match(accordion, /<h3[^>]*><button[^>]*aria-expanded="true"[^>]*>/);
  assert.match(accordion, /Two mailboxes/);
  assert.doesNotMatch(accordion, /Three rules/);

  const command = renderToStaticMarkup(
    <Command defaultSearch="arch">
      <CommandInput label="Search" />
      <CommandList>
        <CommandItem value="Compose">Compose</CommandItem>
        <CommandItem value="Archive">Archive</CommandItem>
      </CommandList>
      <CommandEmpty>Nothing</CommandEmpty>
    </Command>,
  );
  assert.match(command, /<input[^>]*role="combobox"[^>]*aria-label="Search"[^>]*value="arch"/);
  assert.equal((command.match(/role="option"/g) ?? []).length, 1);
  assert.match(command, /role="option"[^>]*>Archive</);
  assert.match(command, /<div role="status"[^>]*><\/div>/);
});

test("an Avatar's picture is in the server markup, over initials that hold its place", () => {
  const html = renderToStaticMarkup(
    <Avatar size="lg">
      <AvatarImage src="/ada.png" alt="Ada King" />
      <AvatarFallback>AK</AvatarFallback>
    </Avatar>,
  );
  assert.match(html, /<span data-slot="avatar" data-size="lg" class="[^"]*size-10[^"]*">/);
  assert.match(html, /<img data-slot="avatar-image" src="\/ada\.png" alt="Ada King"/);
  assert.match(html, /<span data-slot="avatar-fallback"[^>]*>AK<\/span>/);
  // A scroll area is plain markup too: its content is there without a script.
  assert.match(renderToStaticMarkup(<ScrollArea className="h-40">Inbox</ScrollArea>), /Inbox/);
});
