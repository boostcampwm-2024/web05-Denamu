import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar.tsx";

import { ProfileTab } from "@/types/profile.ts";
import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();
const mockToast = vi.fn();
const logout = vi.fn();

vi.mock("lucide-react", () => lucideProxy());

vi.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));
vi.mock("@/hooks/common/useCustomToast.ts", () => ({ useCustomToast: () => ({ toast: mockToast }) }));
vi.mock("@/store/useAuthStore.ts", () => ({ useAuthStore: () => ({ logout }) }));

describe("ProfileSidebar", () => {
  beforeEach(() => vi.clearAllMocks());

  it("isOwner면 탭들을 렌더링하고 클릭 시 onTabChange를 호출해야 한다", () => {
    const onTabChange = vi.fn();
    render(<ProfileSidebar activeTab={"mypage" as ProfileTab} onTabChange={onTabChange} isOwner={true} />);

    fireEvent.click(screen.getByRole("button", { name: /RSS 관리/ }));

    expect(onTabChange).toHaveBeenCalledWith("rss");
  });

  it("isOwner가 아니면 탭과 로그아웃을 렌더링하지 않아야 한다", () => {
    render(<ProfileSidebar activeTab={"mypage" as ProfileTab} onTabChange={vi.fn()} isOwner={false} />);

    expect(screen.queryByRole("button", { name: /RSS 관리/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /로그아웃/ })).not.toBeInTheDocument();
  });

  it("로그아웃 클릭 시 logout, toast, navigate를 호출해야 한다", () => {
    render(<ProfileSidebar activeTab={"mypage" as ProfileTab} onTabChange={vi.fn()} isOwner={true} />);

    fireEvent.click(screen.getByRole("button", { name: /로그아웃/ }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "로그아웃 성공" }));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
