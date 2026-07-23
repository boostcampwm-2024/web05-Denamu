import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { BlockedProfileView } from "@/components/profile/BlockedProfileView.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const mockNavigate = vi.fn();
const mockToast = vi.fn();
const mockUnblockUser = vi.fn();
let mockIsPending = false;

vi.mock("lucide-react", () => lucideProxy());
vi.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));
vi.mock("@/hooks/common/useCustomToast.ts", () => ({ useCustomToast: () => ({ toast: mockToast }) }));
vi.mock("@/hooks/queries/useBlock.ts", () => ({
  useUnblockUser: () => ({ mutate: mockUnblockUser, isPending: mockIsPending }),
}));

describe("BlockedProfileView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
  });

  it("차단 안내 문구와 홈으로/차단 해제 버튼을 렌더링해야 한다", () => {
    render(<BlockedProfileView userId={2} />);

    expect(screen.getByText("차단한 사용자입니다")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "홈으로" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "차단 해제" })).toBeInTheDocument();
  });

  it("홈으로 버튼 클릭 시 /로 이동해야 한다", () => {
    render(<BlockedProfileView userId={2} />);

    fireEvent.click(screen.getByRole("button", { name: "홈으로" }));

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("차단 해제 버튼 클릭 시 unblock mutation을 호출해야 한다", () => {
    render(<BlockedProfileView userId={2} />);

    fireEvent.click(screen.getByRole("button", { name: "차단 해제" }));

    expect(mockUnblockUser).toHaveBeenCalledWith(2, expect.any(Object));
  });

  it("차단 해제 요청 중에는 버튼이 비활성화되어야 한다", () => {
    mockIsPending = true;

    render(<BlockedProfileView userId={2} />);

    expect(screen.getByRole("button", { name: "차단 해제" })).toBeDisabled();
  });
});
