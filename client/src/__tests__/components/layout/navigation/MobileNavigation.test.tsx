import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import MobileNavigation from "@/components/layout/navigation/MobileNavigation.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();
const setTap = vi.fn();
const setIsOpen = vi.fn();
let isOpen: boolean;

vi.mock("lucide-react", () => lucideProxy());

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/store/useTapStore", () => ({
  useTapStore: () => ({ setTap }),
}));

vi.mock("@/store/useSidebarStore", () => ({
  useSidebarStore: () => ({ isOpen, setIsOpen }),
}));

vi.mock("@/assets/logo-denamu-title.svg", () => ({ default: "logo.svg" }));

vi.mock("@/components/search/SearchButton", () => ({
  default: ({ handleSearchModal }: { handleSearchModal: () => void }) => (
    <button data-testid="search-button" onClick={handleSearchModal} />
  ),
}));

vi.mock("@/components/layout/Sidebar", () => ({
  default: ({ handleRssModal }: { handleRssModal: () => void }) => (
    <button data-testid="sidebar" onClick={handleRssModal} />
  ),
}));

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("MobileNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isOpen = false;
  });

  it("로고 클릭 시 tap을 main으로 설정하고 /로 이동해야 한다", () => {
    render(<MobileNavigation toggleModal={vi.fn()} />);

    fireEvent.click(screen.getByAltText("Logo").closest("button")!);

    expect(setTap).toHaveBeenCalledWith("main");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("메뉴(Menu) 버튼 클릭 시 setIsOpen을 호출해야 한다", () => {
    render(<MobileNavigation toggleModal={vi.fn()} />);

    fireEvent.click(screen.getByTestId("lucide-Menu").closest("button")!);

    expect(setIsOpen).toHaveBeenCalled();
  });

  it("SearchButton 클릭 시 toggleModal('search')를 호출해야 한다", () => {
    const toggleModal = vi.fn();
    render(<MobileNavigation toggleModal={toggleModal} />);

    fireEvent.click(screen.getByTestId("search-button"));

    expect(toggleModal).toHaveBeenCalledWith("search");
  });

  it("SideBar의 handleRssModal 호출 시 toggleModal('rss')를 호출해야 한다", () => {
    const toggleModal = vi.fn();
    render(<MobileNavigation toggleModal={toggleModal} />);

    fireEvent.click(screen.getByTestId("sidebar"));

    expect(toggleModal).toHaveBeenCalledWith("rss");
  });
});
