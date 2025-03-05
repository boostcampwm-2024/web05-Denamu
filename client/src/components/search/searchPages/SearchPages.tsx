import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import generatePage from "@/utils/pagination";

import { useSearchStore } from "@/store/useSearchStore";

export default function SearchPages({ totalPages }: { totalPages: number }) {
  const { page, setPage } = useSearchStore();
  const pageNumber = generatePage(page, totalPages);

  const handlePage = (mode: number | "prev" | "next") => {
    switch (mode) {
      case "prev":
        if (page > 1) setPage(page - 1);
        break;
      case "next":
        if (page < totalPages) setPage(page + 1);
        break;
      default:
        if (typeof mode === "number") setPage(mode);
    }
  };

  return (
    <Pagination className="flex gap-4 absolute bottom-0">
      <PaginationPrevious onClick={() => handlePage("prev")} className="border-none" />

      <PaginationContent>
        {page > 2 && <PaginationEllipsis />}
        {pageNumber.map((number) => (
          <PaginationItem key={number}>
            <PaginationLink onClick={() => handlePage(number)} className={page === number ? "border" : ""}>
              {number}
            </PaginationLink>
          </PaginationItem>
        ))}
        {page < totalPages - 2 && <PaginationEllipsis />}
      </PaginationContent>

      <PaginationNext onClick={() => handlePage("next")} className="border-none" />
    </Pagination>
  );
}
