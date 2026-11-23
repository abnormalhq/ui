"use client";

import { SidePane, SidePaneContent, SidePaneHeader, SidePaneTitle, SidePaneToggle } from "@/components/ui/side-pane";
import { FacetCount, FacetGroup, FacetItem, FacetLabel, FacetList, FacetRow } from "@/components/ui/facet-list";
import {
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
} from "@/components/ui/description-list";

export const defaultCopy = {
  filters: "Filters",
  hideFilters: "Hide filters",
  showFilters: "Show filters",
  details: "Details",
  hideDetails: "Hide details",
  showDetails: "Show details",
  all: "All",
  open: "Open",
  answered: "Answered",
  closed: "Closed",
  list: "The list takes the room the folded panes give up.",
  subject: "Subject",
  subjectValue: "Cannot sign in on the phone",
  mailbox: "Mailbox",
  updated: "Updated",
  updatedValue: "5 minutes ago",
};

/* Both panes keep their own state here; a project reads a cookie on the server into `defaultCollapsed`. */
export default function SidePaneDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const statuses = [
    { id: "all", count: "1,240" },
    { id: "open", count: "36" },
    { id: "answered", count: "112" },
    { id: "closed", count: "1,092" },
  ] as const;
  return (
    <div className="flex h-72 w-full max-w-3xl gap-1 overflow-x-auto rounded-mark border border-border bg-muted/40 p-1">
      <SidePane side="start" aria-label={copy.filters} className="w-48 rounded-mark bg-background">
        <SidePaneHeader>
          <SidePaneTitle>{copy.filters}</SidePaneTitle>
          <SidePaneToggle collapseLabel={copy.hideFilters} expandLabel={copy.showFilters} />
        </SidePaneHeader>
        <SidePaneContent className="px-2 pb-2">
          <FacetGroup>
            <FacetList aria-label={copy.filters}>
              {statuses.map(({ id, count }) => (
                <FacetItem key={id}>
                  <FacetRow selected={id === "open"}>
                    <FacetLabel>{copy[id]}</FacetLabel>
                    <FacetCount>{count}</FacetCount>
                  </FacetRow>
                </FacetItem>
              ))}
            </FacetList>
          </FacetGroup>
        </SidePaneContent>
      </SidePane>
      <div className="flex min-w-0 flex-1 items-center justify-center rounded-mark bg-background p-4 text-center text-sm text-muted-foreground">
        {copy.list}
      </div>
      <SidePane side="end" aria-label={copy.details} className="w-60 rounded-mark bg-background">
        <SidePaneHeader>
          <SidePaneTitle>{copy.details}</SidePaneTitle>
          <SidePaneToggle collapseLabel={copy.hideDetails} expandLabel={copy.showDetails} />
        </SidePaneHeader>
        <SidePaneContent className="px-3 pb-3">
          <DescriptionList variant="lined">
            <DescriptionItem>
              <DescriptionTerm>{copy.subject}</DescriptionTerm>
              <DescriptionDetails>{copy.subjectValue}</DescriptionDetails>
            </DescriptionItem>
            <DescriptionItem>
              <DescriptionTerm>{copy.mailbox}</DescriptionTerm>
              <DescriptionDetails className="font-mono">li@northwind.example</DescriptionDetails>
            </DescriptionItem>
            <DescriptionItem>
              <DescriptionTerm>{copy.updated}</DescriptionTerm>
              <DescriptionDetails>{copy.updatedValue}</DescriptionDetails>
            </DescriptionItem>
          </DescriptionList>
        </SidePaneContent>
      </SidePane>
    </div>
  );
}
