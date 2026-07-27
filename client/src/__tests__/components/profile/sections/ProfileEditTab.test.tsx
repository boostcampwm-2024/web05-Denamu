import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { ProfileEditTab } from "@/components/profile/sections/ProfileEditTab.tsx";

import { checkUserNameAvailability } from "@/api/services/profile.ts";
import { fireEvent, render, screen } from "@testing-library/react";

const mockToast = vi.fn();
const updateProfileMutate = vi.fn();
const changePasswordMutate = vi.fn();
const requestDeleteMutate = vi.fn();
const unlinkMutate = vi.fn();
let linkData: { providers: Array<{ provider: string; providerUserName?: string }>; hasPassword: boolean };

vi.mock("lucide-react", () => lucideProxy());
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));
vi.mock("@/hooks/common/useCustomToast.ts", () => ({ useCustomToast: () => ({ toast: mockToast }) }));
vi.mock("@/store/useAuthStore.ts", () => ({ useAuthStore: () => ({ setUserName: vi.fn(), logout: vi.fn() }) }));
vi.mock("@/hooks/queries/useProfile.ts", () => ({
  useUserProfile: () => ({ data: { userName: "민석", introduction: "", profileImage: null } }),
}));
vi.mock("@/hooks/queries/useOAuthLinks.ts", () => ({
  LINKED_PROVIDERS_KEY: ["linked"],
  useLinkedProviders: () => ({ data: linkData }),
  useUnlinkProvider: () => ({ mutate: unlinkMutate, isPending: false }),
}));
vi.mock("@/hooks/queries/useProfileSettings.ts", () => ({
  useUpdateProfile: () => ({ mutate: updateProfileMutate, isPending: false }),
  useUploadProfileImage: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useChangePassword: () => ({ mutate: changePasswordMutate, isPending: false }),
  useRequestDeleteAccount: () => ({ mutate: requestDeleteMutate, isPending: false }),
}));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({ invalidateQueries: vi.fn() }) }));
vi.mock("@/api/services/profile.ts", () => ({ checkUserNameAvailability: vi.fn() }));
vi.mock("@/api/services/oauthLink.ts", () => ({ initiateOAuthLink: vi.fn() }));
vi.mock("@/utils/redirect.ts", () => ({ nav: { redirect: vi.fn() } }));

vi.mock("@/components/ui/alert-dialog.tsx", () => {
  const pass = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return {
    AlertDialog: pass,
    AlertDialogContent: pass,
    AlertDialogHeader: pass,
    AlertDialogFooter: pass,
    AlertDialogTitle: pass,
    AlertDialogDescription: pass,
    AlertDialogTrigger: pass,
    AlertDialogCancel: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    AlertDialogAction: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
      <button onClick={onClick}>{children}</button>
    ),
  };
});

describe("ProfileEditTab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    linkData = { providers: [], hasPassword: true };
  });

  it("프로필 정보/연결된 계정/회원 탈퇴 카드를 렌더링해야 한다", () => {
    render(<ProfileEditTab userId={1} email="min@test.com" />);

    expect(screen.getByText("프로필 정보")).toBeInTheDocument();
    expect(screen.getByText("연결된 계정")).toBeInTheDocument();
    expect(screen.getAllByText("회원 탈퇴").length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue("min@test.com")).toBeInTheDocument();
  });

  it("이메일 수신 설정 토글을 클릭하면 즉시 저장을 요청한다", () => {
    render(<ProfileEditTab userId={1} email="min@test.com" />);

    fireEvent.click(screen.getByLabelText("마케팅 활용 및 광고성 정보 수신 동의"));

    expect(updateProfileMutate).toHaveBeenCalledWith({ marketingEmailAgreed: true }, expect.any(Object));
  });

  it("변경사항 없이 저장하면 '변경사항이 없습니다' toast 를 띄운다", () => {
    render(<ProfileEditTab userId={1} email="min@test.com" />);

    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "변경사항이 없습니다." }));
    expect(updateProfileMutate).not.toHaveBeenCalled();
  });

  it("닉네임 중복 확인 결과가 사용 가능하면 안내를 표시한다", async () => {
    vi.mocked(checkUserNameAvailability).mockResolvedValue(false);
    render(<ProfileEditTab userId={1} email="min@test.com" />);

    fireEvent.change(screen.getByLabelText("닉네임"), { target: { value: "새닉네임" } });
    fireEvent.click(screen.getByRole("button", { name: "중복 확인" }));

    expect(await screen.findByText("사용 가능한 닉네임입니다.")).toBeInTheDocument();
  });

  it("새 비밀번호가 일치하지 않으면 실패 toast 를 띄운다", () => {
    render(<ProfileEditTab userId={1} email="min@test.com" />);

    fireEvent.change(screen.getByLabelText("새 비밀번호"), { target: { value: "newpass1!" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호 확인"), { target: { value: "different" } });
    fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "새 비밀번호가 일치하지 않습니다." }));
    expect(changePasswordMutate).not.toHaveBeenCalled();
  });

  it("새 비밀번호가 일치하면 changePassword 를 호출한다", () => {
    render(<ProfileEditTab userId={1} email="min@test.com" />);

    fireEvent.change(screen.getByLabelText("새 비밀번호"), { target: { value: "newpass1!" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호 확인"), { target: { value: "newpass1!" } });
    fireEvent.click(screen.getByRole("button", { name: "비밀번호 변경" }));

    expect(changePasswordMutate).toHaveBeenCalled();
  });

  it("회원 탈퇴 신청 시 requestDelete 를 호출한다", () => {
    render(<ProfileEditTab userId={1} email="min@test.com" />);

    fireEvent.click(screen.getByRole("button", { name: "탈퇴 신청" }));

    expect(requestDeleteMutate).toHaveBeenCalled();
  });

  it("연결된 제공자의 해제 버튼 클릭 시 unlinkProvider 를 호출한다", () => {
    linkData = { providers: [{ provider: "google", providerUserName: "g" }], hasPassword: true };
    render(<ProfileEditTab userId={1} email="min@test.com" />);

    fireEvent.click(screen.getByRole("button", { name: "해제" }));

    expect(unlinkMutate).toHaveBeenCalledWith("google", expect.any(Object));
  });
});
