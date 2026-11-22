import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const current = 2;

export const defaultCopy = {
  label: "Pagination",
  previous: "Previous",
  morePages: "More pages",
  pageLabel: "Page {page}",
  next: "Next",
};

export default function PaginationDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <Pagination label={copy.label}>
      <PaginationList>
        <PaginationItem>
          <PaginationPrevious href="#page-1">
            <ChevronLeftIcon />
            {copy.previous}
          </PaginationPrevious>
        </PaginationItem>
        {[1, 2, 3].map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={`#page-${page}`}
              current={page === current}
              aria-label={copy.pageLabel.replace("{page}", String(page))}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis label={copy.morePages} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#page-12" aria-label={copy.pageLabel.replace("{page}", "12")}>
            12
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#page-3">
            {copy.next}
            <ChevronRightIcon />
          </PaginationNext>
        </PaginationItem>
      </PaginationList>
    </Pagination>
  );
}
