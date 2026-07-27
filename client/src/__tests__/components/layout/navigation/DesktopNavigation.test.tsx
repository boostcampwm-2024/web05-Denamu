import { beforeEach, describe, expect, it, vi } from "vitest";

import DesktopNavigation from "@/components/layout/navigation/DesktopNavigation.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();
const setTap = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/store/useTapStore", () => ({
  useTapStore: () => ({ setTap }),
}));

vi.mock("@/assets/logo-denamu-main.svg", () => ({ default: "logo.svg" }));

vi.mock("@/components/common/UserProfileMenu", () => ({
  UserProfileMenu: () => <div data-testid="user-profile-menu" />,
}));

vi.mock("@/components/common/NotificationBell", () => ({
  NotificationBell: () => <div data-testid="notification-bell" />,
}));

vi.mock("@/components/layout/SideButton", () => ({ default: () => <div data-testid="side-button" /> }));

vi.mock("@/components/search/SearchButton", () => ({
  default: ({ handleSearchModal }: { handleSearchModal: () => void }) => (
    <button data-testid="search-button" onClick={handleSearchModal} />
  ),
}));

vi.mock("@/components/ui/navigation-menu", () => ({
  NavigationMenu: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
  NavigationMenuList: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  NavigationMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  NavigationMenuLink: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <a href="#" onClick={onClick}>
      {children}
    </a>
  ),
  navigationMenuTriggerStyle: () => "",
}));

describe("DesktopNavigation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("로고 클릭 시 tap을 main으로 설정하고 /로 이동해야 한다", () => {
    render(<DesktopNavigation toggleModal={vi.fn()} />);

    fireEvent.click(screen.getByAltText("Logo").closest("button")!);

    expect(setTap).toHaveBeenCalledWith("main");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("'서비스 소개' 클릭 시 /about으로 이동해야 한다", () => {
    render(<DesktopNavigation toggleModal={vi.fn()} />);

    fireEvent.click(screen.getByText("서비스 소개"));

    expect(mockNavigate).toHaveBeenCalledWith("/about");
  });

  it("'블로그 등록' 클릭 시 toggleModal('rss')를 호출해야 한다", () => {
    const toggleModal = vi.fn();
    render(<DesktopNavigation toggleModal={toggleModal} />);

    fireEvent.click(screen.getByRole("button", { name: "블로그 등록" }));

    expect(toggleModal).toHaveBeenCalledWith("rss");
  });

  it("SearchButton 클릭 시 toggleModal('search')를 호출해야 한다", () => {
    const toggleModal = vi.fn();
    render(<DesktopNavigation toggleModal={toggleModal} />);

    fireEvent.click(screen.getByTestId("search-button"));

    expect(toggleModal).toHaveBeenCalledWith("search");
  });
});
