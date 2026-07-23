import { beforeEach, describe, expect, it, vi } from "vitest";

import { BlockManagementTab } from "@/components/profile/BlockManagementTab.tsx";

import { BlockedUser } from "@/types/profile.ts";
import { fireEvent, render, screen } from "@testing-library/react";

const mockToast = vi.fn();
const mockUnblockUser = vi.fn();
let mockBlockedUsers: BlockedUser[] = [];
let mockIsLoading = false;

vi.mock("@/hooks/common/useCustomToast.ts", () => ({ useCustomToast: () => ({ toast: mockToast }) }));
vi.mock("@/hooks/queries/useBlock.ts", () => ({
  useBlockedUsers: () => ({ data: mockBlockedUsers, isLoading: mockIsLoading }),
  useUnblockUser: () => ({ mutate: mockUnblockUser, isPending: false }),
}));

describe("BlockManagementTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBlockedUsers = [];
    mockIsLoading = false;
  });

  it("로딩 중이면 로딩 문구를 표시해야 한다", () => {
    mockIsLoading = true;

    render(<BlockManagementTab />);

    expect(screen.getByText("불러오는 중...")).toBeInTheDocument();
  });

  it("차단한 사용자가 없으면 안내 문구를 표시해야 한다", () => {
    render(<BlockManagementTab />);

    expect(screen.getByText("차단한 사용자가 없습니다.")).toBeInTheDocument();
  });

  it("차단한 사용자 목록을 렌더링해야 한다", () => {
    mockBlockedUsers = [
      { userId: 2, userName: "차단유저A", profileImage: "img.png", blockedAt: "2025-08-16" },
      { userId: 3, userName: "차단유저B", profileImage: null, blockedAt: "2025-08-17" },
    ];

    render(<BlockManagementTab />);

    expect(screen.getByText("차단유저A")).toBeInTheDocument();
    expect(screen.getByText("차단유저B")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "차단 해제" })).toHaveLength(2);
  });

  it("차단 해제 버튼 클릭 시 해당 userId로 mutation을 호출해야 한다", () => {
    mockBlockedUsers = [{ userId: 2, userName: "차단유저A", profileImage: null, blockedAt: "2025-08-16" }];

    render(<BlockManagementTab />);

    fireEvent.click(screen.getByRole("button", { name: "차단 해제" }));

    expect(mockUnblockUser).toHaveBeenCalledWith(2, expect.any(Object));
  });
});
