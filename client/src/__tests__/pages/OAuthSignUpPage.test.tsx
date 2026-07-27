import { beforeEach, describe, expect, it, vi } from "vitest";

import OAuthSignUpPage from "@/pages/OAuthSignUpPage.tsx";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockNavigate = vi.fn();
const mockToast = vi.fn();
const mockInitialize = vi.fn();
const completeOAuthRegistration = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/hooks/common/useCustomToast.ts", () => ({
  useCustomToast: () => ({ toast: mockToast }),
}));

vi.mock("@/store/useAuthStore.ts", () => ({
  useAuthStore: (selector: (state: { initialize: typeof mockInitialize }) => unknown) =>
    selector({ initialize: mockInitialize }),
}));

vi.mock("@/api/services/user", () => ({
  completeOAuthRegistration: (...args: unknown[]) => completeOAuthRegistration(...args),
}));

describe("OAuthSignUpPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("닉네임 입력과 시작하기 버튼을 렌더링해야 한다", () => {
    render(<OAuthSignUpPage />);

    expect(screen.getByPlaceholderText("닉네임을 입력하세요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "시작하기" })).toBeInTheDocument();
  });

  it("닉네임이 비어있으면 제출 시 completeOAuthRegistration을 호출하지 않아야 한다", () => {
    render(<OAuthSignUpPage />);

    fireEvent.submit(screen.getByRole("button", { name: "시작하기" }).closest("form")!);

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "닉네임을 입력해주세요." }));
    expect(completeOAuthRegistration).not.toHaveBeenCalled();
  });

  it("이메일 수신 동의 토글은 기본값이 false이며, 닉네임과 함께 제출되어야 한다", async () => {
    completeOAuthRegistration.mockResolvedValue({ message: "가입 완료" });
    render(<OAuthSignUpPage />);

    fireEvent.change(screen.getByPlaceholderText("닉네임을 입력하세요"), { target: { value: "민석" } });
    fireEvent.click(screen.getByLabelText("마케팅 활용 및 광고성 정보 수신 동의"));
    fireEvent.submit(screen.getByRole("button", { name: "시작하기" }).closest("form")!);

    await waitFor(() => {
      expect(completeOAuthRegistration).toHaveBeenCalledWith({
        userName: "민석",
        marketingEmailAgreed: true,
        inactivityEmailAgreed: false,
        noticeEmailAgreed: false,
      });
    });
  });

  it("가입 성공 시 초기화 후 홈으로 이동해야 한다", async () => {
    completeOAuthRegistration.mockResolvedValue({ message: "가입 완료" });
    render(<OAuthSignUpPage />);

    fireEvent.change(screen.getByPlaceholderText("닉네임을 입력하세요"), { target: { value: "민석" } });
    fireEvent.submit(screen.getByRole("button", { name: "시작하기" }).closest("form")!);

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("닉네임 중복(409) 시 안내 토스트를 띄우고 이동하지 않아야 한다", async () => {
    completeOAuthRegistration.mockRejectedValue({
      isAxiosError: true,
      response: { status: 409 },
    });
    render(<OAuthSignUpPage />);

    fireEvent.change(screen.getByPlaceholderText("닉네임을 입력하세요"), { target: { value: "민석" } });
    fireEvent.submit(screen.getByRole("button", { name: "시작하기" }).closest("form")!);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "닉네임 중복" }));
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("기타 실패 시 서버 메시지로 실패 토스트를 띄워야 한다", async () => {
    completeOAuthRegistration.mockRejectedValue({
      isAxiosError: true,
      response: { status: 500, data: { message: "서버 오류" } },
    });
    render(<OAuthSignUpPage />);

    fireEvent.change(screen.getByPlaceholderText("닉네임을 입력하세요"), { target: { value: "민석" } });
    fireEvent.submit(screen.getByRole("button", { name: "시작하기" }).closest("form")!);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "회원가입 실패", description: "서버 오류" })
      );
    });
  });
});
