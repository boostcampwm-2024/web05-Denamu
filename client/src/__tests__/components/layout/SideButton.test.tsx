import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import SideButton from "@/components/layout/SideButton.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();
const setTap = vi.fn();

vi.mock("lucide-react", () => lucideProxy());

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/store/useTapStore", () => ({
  useTapStore: () => ({ setTap }),
}));

vi.mock("@/components/chat/Chat", () => ({ Chat: () => <div data-testid="chat" /> }));
vi.mock("@/components/chat/ChatButton", () => ({ OpenChat: () => <div data-testid="open-chat" /> }));
vi.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useSidebar: () => ({ open: false, isMobile: false, toggleSidebar: vi.fn() }),
}));

describe("SideButton", () => {
  beforeEach(() => vi.clearAllMocks());

  it("Home 버튼 클릭 시 tap을 main으로 설정하고 /로 이동해야 한다", () => {
    render(<SideButton />);

    fireEvent.click(screen.getByTestId("lucide-Home").closest("button")!);

    expect(setTap).toHaveBeenCalledWith("main");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("Chart 버튼 클릭 시 tap을 chart로 설정하고 /로 이동해야 한다", () => {
    render(<SideButton />);

    fireEvent.click(screen.getByTestId("lucide-ChartArea").closest("button")!);

    expect(setTap).toHaveBeenCalledWith("chart");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("ArrowUp 버튼 클릭 시 window.scrollTo를 호출해야 한다", () => {
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<SideButton />);

    fireEvent.click(screen.getByTestId("lucide-ArrowUp").closest("button")!);

    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    scrollSpy.mockRestore();
  });
});
