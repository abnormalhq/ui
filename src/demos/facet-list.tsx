"use client";

import { useCallback, useRef, useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import {
  FacetCount,
  FacetGroup,
  FacetGroupLabel,
  FacetItem,
  FacetLabel,
  FacetList,
  FacetMore,
  FacetRow,
} from "@/components/ui/facet-list";
import { statusDotVariants } from "@/components/ui/status-label";
import { LabelTooltip } from "@/components/ui/tooltip";

export const defaultCopy = {
  views: "Views",
  all: "All",
  active: "Active",
  pending: "Pending",
  disabled: "Disabled",
  domains: "Domains",
  searchDomains: "Search domains",
  clearSearch: "Clear search",
  showMore: "Show more",
  noDomains: "No domain matches",
};

const views = [
  { id: "all", count: "12,480", tone: null },
  { id: "active", count: "11,902", tone: "success" },
  { id: "pending", count: "341", tone: "pending" },
  { id: "disabled", count: "237", tone: "muted" },
] as const;

const domains = [
  { name: "northwind.example", count: "4,210" },
  { name: "harbor.example", count: "3,988" },
  { name: "lumen.example", count: "1,204" },
  { name: "atlas-logistics.example", count: "655" },
  { name: "brightside.example", count: "412" },
  { name: "cobalt.example", count: "208" },
  { name: "meridian.example", count: "97" },
];

/** How many domains the demo shows at a time; a project would ask its server for the next page instead. */
const DOMAIN_PAGE = 4;

/* A project loads the domains a page at a time from its server; this demo filters and pages a short list in memory. */
export default function FacetListDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [view, setView] = useState<(typeof views)[number]["id"]>("all");
  const [domain, setDomain] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(DOMAIN_PAGE);
  const matched = domains.filter(({ name }) => name.includes(query.trim().toLowerCase()));
  const shown = matched.slice(0, limit);
  // The first domain "Show more" reveals takes the focus, since the button goes away once nothing is left to show.
  const reveal = useRef<string | null>(null);
  // One ref for every row, so the tooltip around each row (whose trigger keeps the row in state) gets the same callback
  // on every render; a new one each time would detach and attach the row, and render again, without end.
  const revealed = useCallback((element: HTMLButtonElement | null) => {
    if (element && reveal.current === element.dataset.domain) {
      reveal.current = null;
      element.focus();
    }
  }, []);

  return (
    <div className="grid w-full max-w-60 gap-5">
      <FacetGroup>
        <FacetGroupLabel id="facet-demo-views">{copy.views}</FacetGroupLabel>
        <FacetList aria-labelledby="facet-demo-views">
          {views.map(({ id, count, tone }) => (
            <FacetItem key={id}>
              <FacetRow asChild selected={view === id}>
                <button type="button" aria-pressed={view === id} onClick={() => setView(id)}>
                  <span
                    aria-hidden="true"
                    className={
                      tone ? statusDotVariants({ tone }) : "size-[6px] shrink-0 rounded-full border border-current"
                    }
                  />
                  <FacetLabel>{copy[id]}</FacetLabel>
                  <FacetCount>{count}</FacetCount>
                </button>
              </FacetRow>
            </FacetItem>
          ))}
        </FacetList>
      </FacetGroup>
      <FacetGroup>
        <FacetGroupLabel id="facet-demo-domains">{copy.domains}</FacetGroupLabel>
        <SearchInput
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setLimit(DOMAIN_PAGE);
          }}
          aria-label={copy.searchDomains}
          placeholder={copy.searchDomains}
          clearLabel={copy.clearSearch}
          onClear={() => {
            setQuery("");
            setLimit(DOMAIN_PAGE);
          }}
          className="mb-1"
        />
        <FacetList aria-labelledby="facet-demo-domains">
          {shown.map(({ name, count }) => (
            <FacetItem key={name}>
              <LabelTooltip label={name}>
                <FacetRow asChild selected={domain === name}>
                  <button
                    type="button"
                    aria-pressed={domain === name}
                    data-domain={name}
                    ref={revealed}
                    onClick={() => setDomain(domain === name ? null : name)}
                  >
                    <FacetLabel>{name}</FacetLabel>
                    <FacetCount>{count}</FacetCount>
                  </button>
                </FacetRow>
              </LabelTooltip>
            </FacetItem>
          ))}
        </FacetList>
        {matched.length === 0 && <FacetMore>{copy.noDomains}</FacetMore>}
        {matched.length > shown.length && (
          <FacetMore asChild>
            <button
              type="button"
              onClick={() => {
                reveal.current = matched[shown.length]?.name ?? null;
                setLimit((current) => current + DOMAIN_PAGE);
              }}
            >
              {copy.showMore}
            </button>
          </FacetMore>
        )}
      </FacetGroup>
    </div>
  );
}
