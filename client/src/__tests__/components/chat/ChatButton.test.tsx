import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { CloseChat, OpenChat } from "@/components/chat/ChatButton.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const toggleSidebar = vi.fn();
const setOpenMobile = vi.fn();
const setIsOpen = vi.fn();
let isMobile: boolean;
let isOpen: boolean;

vi.mock("lucide-react", () => lucideProxy());

vi.mock("@/components/ui/sidebar", () => ({
  useSidebar: () => ({ toggleSidebar, isMobile, setOpenMobile }),
}));

vi.mock("@/store/useSidebarStore", () => ({
  useSidebarStore: () => ({ isOpen, setIsOpen }),
}));

describe("OpenChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isMobile = false;
    isOpen = false;
  });

  it("데스크톱에서는 toggleSidebar를 호출해야 한다", () => {
    render(<OpenChat />);

    fireEvent.click(screen.getByRole("button"));

    expect(toggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("모바일에서는 '채팅' 버튼이 setOpenMobile(true)를 호출해야 한다", () => {
    isMobile = true;
    render(<OpenChat />);

    fireEvent.click(screen.getByRole("button", { name: "채팅" }));

    expect(setOpenMobile).toHaveBeenCalledWith(true);
  });
});

describe("CloseChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isOpen = true;
  });

  it("클릭 시 toggleSidebar와 (열려있으면) setIsOpen을 호출해야 한다", () => {
    render(<CloseChat />);

    fireEvent.click(screen.getByRole("button"));

    expect(toggleSidebar).toHaveBeenCalledTimes(1);
    expect(setIsOpen).toHaveBeenCalledTimes(1);
  });
});
