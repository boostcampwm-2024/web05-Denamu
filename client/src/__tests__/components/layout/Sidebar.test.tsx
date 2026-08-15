import { describe, expect, it, vi } from "vitest";

import SideBar from "@/components/layout/Sidebar.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/components/layout/sidebar/NavigationButtons", () => ({
  NavigationButtons: ({ onAction }: { onAction: () => void }) => (
    <button data-testid="nav-buttons" onClick={onAction} />
  ),
}));

vi.mock("@/components/layout/sidebar/AuthSection", () => ({
  AuthSection: ({ onAction }: { onAction: () => void }) => <button data-testid="auth-section" onClick={onAction} />,
}));

vi.mock("@/components/layout/sidebar/ChatSection", () => ({
  ChatSection: () => <div data-testid="chat-section" />,
}));

vi.mock("@/components/layout/sidebar/RssButton", () => ({
  RssButton: ({ onRssClick, onAction }: { onRssClick: () => void; onAction: () => void }) => (
    <button
      data-testid="rss-button"
      onClick={() => {
        onRssClick();
        onAction();
      }}
    />
  ),
}));

vi.mock("@/components/layout/sidebar/LogoutButton", () => ({
  LogoutButton: () => <div data-testid="logout-button" />,
}));

describe("SideBar", () => {
  it("5개의 하위 섹션을 렌더링해야 한다", () => {
    render(<SideBar handleRssModal={vi.fn()} handleSidebar={vi.fn()} />);

    expect(screen.getByTestId("nav-buttons")).toBeInTheDocument();
    expect(screen.getByTestId("auth-section")).toBeInTheDocument();
    expect(screen.getByTestId("chat-section")).toBeInTheDocument();
    expect(screen.getByTestId("rss-button")).toBeInTheDocument();
    expect(screen.getByTestId("logout-button")).toBeInTheDocument();
  });

  it("handleSidebar가 NavigationButtons/AuthSection의 onAction으로 전달되어야 한다", () => {
    const handleSidebar = vi.fn();
    render(<SideBar handleRssModal={vi.fn()} handleSidebar={handleSidebar} />);

    fireEvent.click(screen.getByTestId("nav-buttons"));
    fireEvent.click(screen.getByTestId("auth-section"));

    expect(handleSidebar).toHaveBeenCalledTimes(2);
  });

  it("RssButton 클릭 시 handleRssModal과 handleSidebar가 호출되어야 한다", () => {
    const handleRssModal = vi.fn();
    const handleSidebar = vi.fn();
    render(<SideBar handleRssModal={handleRssModal} handleSidebar={handleSidebar} />);

    fireEvent.click(screen.getByTestId("rss-button"));

    expect(handleRssModal).toHaveBeenCalledTimes(1);
    expect(handleSidebar).toHaveBeenCalledTimes(1);
  });
});
