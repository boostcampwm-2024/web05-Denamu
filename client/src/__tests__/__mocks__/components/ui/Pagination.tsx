import { ReactNode } from "react";

type MockPaginationProps = {
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
};

export const mockPagination = {
  Pagination: ({ className, children }: MockPaginationProps) => (
    <nav className={className}>{children}</nav>
  ),
  PaginationContent: ({ children }: MockPaginationProps) => <ul>{children}</ul>,
  PaginationItem: ({ children }: MockPaginationProps) => <li>{children}</li>,
  PaginationLink: ({ className, onClick, children }: MockPaginationProps) => (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  ),
  PaginationPrevious: ({ onClick, className }: MockPaginationProps) => (
    <button onClick={onClick} className={className}>
      Previous
    </button>
  ),
  PaginationNext: ({ onClick, className }: MockPaginationProps) => (
    <button onClick={onClick} className={className}>
      Next
    </button>
  ),
  PaginationEllipsis: () => <span>...</span>,
};
