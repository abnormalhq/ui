/*
 * Renders the display items the way a Server Component page would, with no DOM: what a page of a project gets before
 * any client code runs. Most of these items have no "use client" at all, so this is all they ever render.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { encode } from "uqr";
import { Badge, BadgeCount, BadgeDot } from "@/components/ui/badge";
import { Bento, BentoDescription, BentoTile, BentoTitle, BentoVisual } from "@/components/ui/bento";
import { Banner, BannerClose, BannerDot, BannerText } from "@/components/ui/banner";
import { CodeBlock } from "@/components/ui/code-block";
import { DescriptionDetails, DescriptionItem, DescriptionList } from "@/components/ui/description-list";
import { EmptyState, EmptyStateTitle } from "@/components/ui/empty-state";
import { ItemListRow } from "@/components/ui/item-list";
import { Kbd, KbdCombo } from "@/components/ui/kbd";
import { PageHeader, PageHeaderActions, PageHeaderBack, PageHeaderTitle } from "@/components/ui/page-header";
import { PricingCard, PricingPrice } from "@/components/ui/pricing-card";
import { QrCode } from "@/components/ui/qr-code";
import { SkipLink } from "@/components/ui/skip-link";
import { Stat, StatDelta, StatGrid } from "@/components/ui/stat";
import { SortableHead, Table, TableHeader, TableRow } from "@/components/ui/table";
import { Timeline, TimelineItem, TimelineTime } from "@/components/ui/timeline";
import { UptimeBar, UptimeValue, uptimeStatus } from "@/components/ui/uptime-bar";
import { useModifierKey } from "@/components/ui/use-modifier-key";

test("a BadgeCount caps at the number it is given and renders nothing for zero", () => {
  assert.match(renderToStaticMarkup(<BadgeCount count={7} />), />7<\/span>$/);
  assert.match(renderToStaticMarkup(<BadgeCount count={1204} max={99} />), />99\+<\/span>$/);
  assert.match(
    renderToStaticMarkup(<BadgeCount count={1204} max={999} format={(n) => n.toLocaleString("de")} />),
    />999\+</,
  );
  assert.equal(renderToStaticMarkup(<BadgeCount count={0} />), "");
  assert.match(renderToStaticMarkup(<BadgeCount count={0} showZero />), />0<\/span>$/);
  // The small size is the count's default; a plain Badge keeps the 24px one.
  assert.match(renderToStaticMarkup(<BadgeCount count={1} />), /data-size="sm"/);
  assert.match(renderToStaticMarkup(<Badge>Admin</Badge>), /data-size="default"[^>]*class="[^"]*h-6/);
  assert.match(renderToStaticMarkup(<Badge size="sm">Admin</Badge>), /class="[^"]*h-5[^"]*text-2xs/);
});

test("a BadgeDot is decoration unless it is given a label", () => {
  assert.match(renderToStaticMarkup(<BadgeDot />), /aria-hidden="true"/);
  const named = renderToStaticMarkup(<BadgeDot label="New replies" />);
  assert.match(named, /role="img"/);
  assert.match(named, /aria-label="New replies"/);
  assert.doesNotMatch(named, /aria-hidden/);
});

test("an UptimeBar is one named image of titled bars, colored by status, with no script", () => {
  const html = renderToStaticMarkup(
    <UptimeBar
      label="Last 4 days"
      buckets={[
        { status: "none" },
        { status: "up", title: "Day 2: all passed" },
        { status: "degraded", title: "Day 3: 3 of 4 passed" },
        { status: "down", title: "Day 4: none passed" },
      ]}
    />,
  );
  assert.match(html, /^<div role="img" aria-label="Last 4 days"/);
  assert.equal([...html.matchAll(/<span /g)].length, 4);
  assert.match(html, /data-status="degraded" title="Day 3: 3 of 4 passed" class="[^"]*bg-badge-ink/);
  assert.match(html, /data-status="down"[^>]*class="[^"]*bg-destructive/);
  assert.deepEqual(
    [
      [0, 0],
      [5, 5],
      [3, 5],
      [0, 5],
    ].map(([up, total]) => uptimeStatus(up!, total!)),
    ["none", "up", "degraded", "down"],
  );
});

test("an UptimeValue takes the color of the uptime, and shows its empty text without one", () => {
  const status = (percent: number | null) =>
    renderToStaticMarkup(
      <UptimeValue percent={percent} empty="—">
        {String(percent)}
      </UptimeValue>,
    ).match(/data-status="([^"]+)"/)?.[1];
  assert.deepEqual([100, 99.5, 98, null].map(status), ["up", "degraded", "down", "none"]);
  assert.match(renderToStaticMarkup(<UptimeValue percent={null} empty="—" />), />—<\/span>$/);
});

test("a QrCode draws uqr's matrix as one path on white, named as an image", () => {
  const html = renderToStaticMarkup(<QrCode value="https://example.com" label="QR code for the link" />);
  const size = encode("https://example.com", { ecc: "M", border: 4 }).size;
  assert.match(
    html,
    new RegExp(`^<svg[^>]*role="img"[^>]*aria-label="QR code for the link"[^>]*viewBox="0 0 ${size} ${size}"`),
  );
  assert.match(html, /<rect[^>]*class="fill-white"/);
  assert.match(html, /<path d="M\d+ \d+h1v1h-1z[^"]*" class="fill-black"/);
});

test("a SortableHead marks its column's sort and links to the other direction", () => {
  const head = (direction?: "asc" | "desc") =>
    renderToStaticMarkup(
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead direction={direction} href="?sort=name" title="Sort">
              Name
            </SortableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
  assert.match(head("asc"), /<th[^>]*aria-sort="ascending"><a[^>]*href="\?sort=name" title="Sort"[^>]*>Name<svg/);
  assert.match(head("desc"), /aria-sort="descending"/);
  assert.match(head(), /aria-sort="none"/);
  assert.match(head("asc"), /lucide-arrow-up/);
  assert.match(head(), /lucide-chevrons-up-down/);
  // With the router's link as the child, the arrow goes inside that link.
  const asChild = renderToStaticMarkup(
    <SortableHead direction="desc" asChild>
      <a href="/list?sort=name">Name</a>
    </SortableHead>,
  );
  assert.match(asChild, /<a[^>]*href="\/list\?sort=name"[^>]*>Name<svg[^>]*lucide-arrow-down/);
});

test("a PricingCard reads the original price out before striking it", () => {
  const html = renderToStaticMarkup(
    <PricingCard name="Team" price="$9" discount="25% off" originalPrice="$12" originalPriceLabel="Original price" />,
  );
  assert.match(html, /25% off/);
  assert.match(html, /<span class="sr-only">Original price <\/span><s>\$12<\/s>/);
  assert.doesNotMatch(renderToStaticMarkup(<PricingCard name="Team" price="$9" />), /pricing-card-discount/);
});

test("a Banner is a status unless told to interrupt, and its close button carries the name it is given", () => {
  const html = renderToStaticMarkup(
    <Banner tone="warning">
      <BannerText>Maintenance on Sunday</BannerText>
      <BannerClose label="Dismiss" />
    </Banner>,
  );
  assert.match(html, /^<div data-slot="banner" data-variant="strip" data-tone="warning" role="status"/);
  // The close button's ×, drawn inline rather than from lucide-react.
  assert.match(html, /<button[^>]*><svg[^>]*aria-hidden="true"[^>]*><path d="M18 6 6 18"/);
  const panel = renderToStaticMarkup(
    <Banner variant="panel" tone="success">
      <BannerText>
        <BannerDot />
        All systems operational
      </BannerText>
    </Banner>,
  );
  assert.match(panel, /class="[^"]*rounded-panel[^"]*bg-success\/8[^"]*border-success\/40/);
  assert.match(panel, /<span data-slot="banner-dot" aria-hidden="true"/);
  assert.match(html, /<button[^>]*aria-label="Dismiss"[^>]*title="Dismiss"/);
  assert.match(renderToStaticMarkup(<Banner role="alert">Sending is paused</Banner>), /role="alert"/);
});

test("a CodeBlock without a title is a region only when it is named, and puts its code in one code element", () => {
  const plain = renderToStaticMarkup(<CodeBlock>ls</CodeBlock>);
  assert.match(plain, /<pre[^>]*tabindex="0"[^>]*><code>ls<\/code><\/pre>/);
  assert.doesNotMatch(plain, /role="region"|<button/);
  const named = renderToStaticMarkup(<CodeBlock aria-label="Request">ls</CodeBlock>);
  assert.match(named, /<pre[^>]*role="region" aria-label="Request"/);
});

test("the page and list pieces render the elements their outline needs", () => {
  const header = renderToStaticMarkup(
    <PageHeader sticky>
      <PageHeaderBack href="/mailboxes">Mailboxes</PageHeaderBack>
      <PageHeaderTitle>hello@example.com</PageHeaderTitle>
    </PageHeader>,
  );
  assert.match(header, /^<header data-slot="page-header" data-sticky="true"[^>]*class="[^"]*sticky top-0/);
  assert.match(header, /<a[^>]*href="\/mailboxes"[^>]*><svg[^>]*aria-hidden="true"[^>]*>.*<\/svg>Mailboxes<\/a>/);
  assert.match(header, /<h1 data-slot="page-header-title"/);

  const empty = renderToStaticMarkup(
    <EmptyState>
      <EmptyStateTitle asChild>
        <h1>Page not found</h1>
      </EmptyStateTitle>
    </EmptyState>,
  );
  assert.match(empty, /<h1 data-slot="empty-state-title"/);

  const list = renderToStaticMarkup(
    <DescriptionList>
      <DescriptionItem label="Host">mail.example.com</DescriptionItem>
      <DescriptionItem>
        <DescriptionDetails action={<button type="button">Copy</button>}>key</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>,
  );
  assert.match(list, /^<dl[^>]*><div[^>]*><dt[^>]*>Host<\/dt><dd[^>]*>mail.example.com<\/dd><\/div>/);
  assert.match(list, /<dd[^>]*><span[^>]*>key<\/span><span data-slot="description-action"[^>]*><button/);

  const stats = renderToStaticMarkup(
    <StatGrid>
      <Stat label="Sent" value="12">
        <StatDelta direction="up" tone="success">
          +2
        </StatDelta>
      </Stat>
    </StatGrid>,
  );
  assert.match(stats, /^<dl[^>]*><div[^>]*><dt[^>]*>Sent<\/dt><dd[^>]*>12<\/dd><dd[^>]*><svg[^>]*aria-hidden="true"/);

  const timeline = renderToStaticMarkup(
    <Timeline aria-label="Updates">
      <TimelineItem tone="success">
        <TimelineTime dateTime="2026-11-14T04:10:00Z">04:10</TimelineTime>
      </TimelineItem>
    </Timeline>,
  );
  assert.match(timeline, /^<ol data-slot="timeline"[^>]*aria-label="Updates"><li[^>]*data-tone="success"/);
  assert.match(timeline, /<time data-slot="timeline-time"[^>]*="2026-11-14T04:10:00Z">04:10<\/time>/);

  assert.match(
    renderToStaticMarkup(
      <ItemListRow asChild>
        <a href="/tickets/1">Ticket</a>
      </ItemListRow>,
    ),
    /^<a href="\/tickets\/1" data-slot="item-list-row"[^>]*>Ticket<\/a>$/,
  );
  assert.match(
    renderToStaticMarkup(
      <KbdCombo>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdCombo>,
    ),
    /^<kbd data-slot="kbd-combo"[^>]*><kbd data-slot="kbd"[^>]*>⌘<\/kbd><kbd/,
  );
  assert.match(renderToStaticMarkup(<SkipLink href="#main">Skip to content</SkipLink>), /focus:translate-y-0/);
});

test("useModifierKey knows no platform on the server", () => {
  let seen: string | null | undefined;
  function Probe() {
    seen = useModifierKey();
    return null;
  }
  renderToStaticMarkup(<Probe />);
  assert.equal(seen, null);
});

test("PageHeaderActions wrap by default, and keep one scrolling line with scroll, on any element given asChild", () => {
  const wrapped = renderToStaticMarkup(
    <PageHeaderActions>
      <button type="button">Export</button>
    </PageHeaderActions>,
  );
  assert.match(wrapped, /^<div data-slot="page-header-actions" class="[^"]*flex-wrap/);
  assert.doesNotMatch(wrapped, /overflow-x-auto|data-scroll/);

  const scrolling = renderToStaticMarkup(
    <PageHeaderActions scroll asChild>
      <section aria-label="Actions">
        <button type="button">Export</button>
      </section>
    </PageHeaderActions>,
  );
  assert.match(scrolling, /^<section [^>]*data-slot="page-header-actions" data-scroll="true" class="[^"]*flex-nowrap/);
  assert.match(scrolling, /overflow-x-auto/);
  assert.doesNotMatch(scrolling, /flex-wrap/);
  assert.match(scrolling, /aria-label="Actions"/);
});

test("a SkipLink casts its shadow only while it has the focus", () => {
  const html = renderToStaticMarkup(<SkipLink href="#main">Skip to content</SkipLink>);
  const classes = html.match(/class="([^"]*)"/)![1]!.split(" ");
  assert.ok(classes.includes("focus:shadow-popover"));
  assert.ok(!classes.includes("shadow-popover"), "no shadow while it waits above the edge");
});

test("a DescriptionList stacks each value under its name, or lines its rows with the values in one column", () => {
  const list = (variant: "stacked" | "lined") =>
    renderToStaticMarkup(
      <DescriptionList variant={variant}>
        <DescriptionItem label="Host">mail.example.com</DescriptionItem>
        <DescriptionItem label="Port">993</DescriptionItem>
      </DescriptionList>,
    );
  const stacked = list("stacked");
  assert.match(stacked, /^<dl data-slot="description-list" data-variant="stacked"/);
  assert.match(
    stacked,
    /<div data-slot="description-item" class="[^"]*group-data-\[variant=stacked\]\/description-list:flex-col/,
  );
  const lined = list("lined");
  assert.match(
    lined,
    /^<dl[^>]*data-variant="lined"[^>]*class="[^"]*grid-cols-\[auto_minmax\(0,1fr\)\][^"]*max-sm:grid-cols-1/,
  );
  assert.match(lined, /group-data-\[variant=lined\]\/description-list:grid-cols-subgrid/);
  assert.match(lined, /group-data-\[variant=lined\]\/description-list:border-t/);
  assert.equal(lined.match(/<dt/g)?.length, 2);
});

test("PricingPrice renders the card's price on its own, and the card renders it unchanged", () => {
  const html = renderToStaticMarkup(
    <PricingPrice
      price="$9"
      period="per mailbox / month"
      discount="25% off"
      originalPrice="$12"
      originalPriceLabel="Original price"
      size="sm"
    />,
  );
  assert.match(html, /^<div data-slot="pricing-price" data-size="sm"/);
  assert.match(html, /<p data-slot="pricing-card-price"[^>]*><span class="[^"]*text-xl[^"]*">\$9<\/span>/);
  assert.match(html, /<span class="sr-only">Original price <\/span><s>\$12<\/s>/);
  assert.doesNotMatch(html, /data-slot="marker"/);
  assert.match(renderToStaticMarkup(<PricingPrice price="$9" highlight />), /data-slot="marker"[^>]*>\$9</);

  const card = renderToStaticMarkup(
    <PricingCard name="Team" price="$9" icon={<svg data-icon="" />} discount="25% off" />,
  );
  assert.match(
    card,
    /<div data-slot="pricing-card-header"[^>]*><div data-slot="pricing-card-icon"[^>]*><svg data-icon=""><\/svg><\/div>/,
  );
  assert.match(
    card,
    /<div data-slot="pricing-price" data-size="default" class="grid gap-3"><p data-slot="pricing-card-price"/,
  );
  assert.match(card, /text-display-sm/);
  assert.doesNotMatch(renderToStaticMarkup(<PricingCard name="Team" price="$9" />), /pricing-card-icon/);
});

test("a Bento renders on the server as a list of tiles, a wide tile spanning two columns from sm", () => {
  const html = renderToStaticMarkup(
    <Bento asChild>
      <ul role="list">
        <BentoTile asChild wide>
          <li>
            <BentoTitle>Undo</BentoTitle>
            <BentoDescription>Take it back.</BentoDescription>
            <BentoVisual aria-hidden="true">Sent</BentoVisual>
          </li>
        </BentoTile>
        <BentoTile asChild>
          <li>
            <BentoTitle asChild>
              <h4>Search</h4>
            </BentoTitle>
          </li>
        </BentoTile>
      </ul>
    </Bento>,
  );
  assert.match(html, /^<ul role="list" data-slot="bento" class="[^"]*sm:grid-cols-2[^"]*lg:grid-cols-3/);
  assert.match(html, /<li data-slot="bento-tile" data-wide="true" class="[^"]*sm:col-span-2/);
  assert.match(html, /<h3 data-slot="bento-title"[^>]*>Undo<\/h3>/);
  assert.match(html, /<div data-slot="bento-visual" class="mt-auto min-w-0" aria-hidden="true">Sent<\/div>/);
  assert.match(html, /<li data-slot="bento-tile" class="(?![^"]*col-span)[^"]*"><h4 data-slot="bento-title"/);
  assert.equal(html.match(/<li /g)?.length, 2);
  // Outside a list a tile is an article, and the wall a div.
  assert.match(
    renderToStaticMarkup(
      <Bento>
        <BentoTile>Alone</BentoTile>
      </Bento>,
    ),
    /^<div data-slot="bento"[^>]*><article data-slot="bento-tile" class="[^"]*">Alone<\/article><\/div>$/,
  );
});
