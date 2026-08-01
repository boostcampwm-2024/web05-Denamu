import { beforeEach, describe, expect, it, vi } from "vitest";

import Header from "@/components/layout/Header.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const isMobileMock = vi.fn(() => false);

vi.mock("@/store/useMediaStore", () => ({
  useMediaStore: (selector: (s: { isMobile: boolean }) => unknown) => selector({ isMobile: isMobileMock() }),
}));

vi.mock("@/hooks/common/useKeyboardShortcut", () => ({
  useKeyboardShortcut: vi.fn(),
}));

const navStub = ({ toggleModal }: { toggleModal: (m: "search" | "rss") => void }, testid: string) => (
  <div data-testid={testid}>
    <button data-testid="open-rss" onClick={() => toggleModal("rss")} />
    <button data-testid="open-search" onClick={() => toggleModal("search")} />
  </div>
);

vi.mock("@/components/layout/navigation/DesktopNavigation", () => ({
  default: (props: { toggleModal: (m: "search" | "rss") => void }) => navStub(props, "desktop-nav"),
}));

vi.mock("@/components/layout/navigation/MobileNavigation", () => ({
  default: (props: { toggleModal: (m: "search" | "rss") => void }) => navStub(props, "mobile-nav"),
}));

vi.mock("@/components/RssRegistration/RssRegistrationModal", () => ({
  RssRegistrationModal: () => <div data-testid="rss-modal" />,
}));

vi.mock("@/components/search/SearchModal", () => ({
  default: () => <div data-testid="search-modal" />,
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isMobileMock.mockReturnValue(false);
  });

  it("데스크톱에서는 DesktopNavigation을 렌더링해야 한다", () => {
    render(<Header />);

    expect(screen.getByTestId("desktop-nav")).toBeInTheDocument();
    expect(screen.queryByTestId("mobile-nav")).not.toBeInTheDocument();
  });

  it("모바일에서는 MobileNavigation을 렌더링해야 한다", () => {
    isMobileMock.mockReturnValue(true);
    render(<Header />);

    expect(screen.getByTestId("mobile-nav")).toBeInTheDocument();
    expect(screen.queryByTestId("desktop-nav")).not.toBeInTheDocument();
  });

  it("초기에는 RSS/검색 모달이 닫혀 있어야 한다", () => {
    render(<Header />);

    expect(screen.queryByTestId("rss-modal")).not.toBeInTheDocument();
    expect(screen.queryByTestId("search-modal")).not.toBeInTheDocument();
  });

  it("toggleModal('rss') 호출 시 RssRegistrationModal이 열려야 한다", () => {
    render(<Header />);

    fireEvent.click(screen.getByTestId("open-rss"));

    expect(screen.getByTestId("rss-modal")).toBeInTheDocument();
  });

  it("toggleModal('search') 호출 시 SearchModal이 열려야 한다", () => {
    render(<Header />);

    fireEvent.click(screen.getByTestId("open-search"));

    expect(screen.getByTestId("search-modal")).toBeInTheDocument();
  });
});
