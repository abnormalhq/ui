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

export default function PaginationDemo() {
  return (
    <Pagination label="Pagination">
      <PaginationList>
        <PaginationItem>
          <PaginationPrevious href="#page-1">
            <ChevronLeftIcon />
            Previous
          </PaginationPrevious>
        </PaginationItem>
        {[1, 2, 3].map((page) => (
          <PaginationItem key={page}>
            <PaginationLink href={`#page-${page}`} current={page === current} aria-label={`Page ${page}`}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis label="More pages" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#page-12" aria-label="Page 12">
            12
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#page-3">
            Next
            <ChevronRightIcon />
          </PaginationNext>
        </PaginationItem>
      </PaginationList>
    </Pagination>
  );
}
