import { beforeEach, describe, expect, it, vi } from "vitest";

import { lucideProxy } from "@/__tests__/__mocks__/external/lucide-proxy.tsx";
import { ProfileHeader } from "@/components/profile/ProfileHeader.tsx";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockToast = vi.fn();
const mockBlockUser = vi.fn().mockResolvedValue(undefined);
const mockBlockRss = vi.fn().mockResolvedValue(undefined);
type RssRow = { id: number; name: string; blogPlatform: string };
const mockCertifiedRss = vi.fn<() => { data: RssRow[] }>(() => ({ data: [] }));

vi.mock("lucide-react", () => lucideProxy());
vi.mock("@/hooks/common/useCustomToast.ts", () => ({ useCustomToast: () => ({ toast: mockToast }) }));
vi.mock("@/hooks/queries/useBlock.ts", () => ({
  useBlockUser: () => ({ mutateAsync: mockBlockUser }),
  useBlockRss: () => ({ mutateAsync: mockBlockRss }),
}));
vi.mock("@/hooks/queries/useProfile.ts", () => ({ useCertifiedRss: () => mockCertifiedRss() }));
vi.mock("@/hooks/queries/useReport", () => ({
  useReportUser: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe("ProfileHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCertifiedRss.mockReturnValue({ data: [] });
  });

  it("이름, 이메일, 자기소개를 렌더링해야 한다", () => {
    render(<ProfileHeader name="민석" email="min@test.com" profileImage="img.png" introduction="안녕하세요" />);

    expect(screen.getByRole("heading", { name: "민석" })).toBeInTheDocument();
    expect(screen.getByText("min@test.com")).toBeInTheDocument();
    expect(screen.getByText("안녕하세요")).toBeInTheDocument();
    expect(screen.getByTestId("avatar-image")).toHaveAttribute("src", "img.png");
  });

  it("자기소개가 없으면 기본 안내 문구를 표시해야 한다", () => {
    render(<ProfileHeader name="민석" email="min@test.com" profileImage={null} introduction={null} />);

    expect(screen.getByText("자기소개가 없습니다.")).toBeInTheDocument();
    expect(screen.queryByTestId("avatar-image")).not.toBeInTheDocument();
  });

  it("이름이 없으면 fallback에 '사용자'를 표시해야 한다", () => {
    render(<ProfileHeader name="" email="" profileImage={null} introduction={null} />);

    expect(screen.getByText("사용자")).toBeInTheDocument();
  });

  it("blockableUserId가 있으면 더보기 버튼을 표시해야 한다", () => {
    render(<ProfileHeader name="민석" email="" profileImage={null} introduction={null} blockableUserId={2} />);

    expect(screen.getByRole("button", { name: "더보기" })).toBeInTheDocument();
  });

  it("blockableUserId가 없으면 더보기 버튼을 표시하지 않아야 한다", () => {
    render(<ProfileHeader name="민석" email="" profileImage={null} introduction={null} />);

    expect(screen.queryByRole("button", { name: "더보기" })).not.toBeInTheDocument();
  });

  const openBlockModal = async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "더보기" }));
    await user.click(await screen.findByText("차단하기"));
    return user;
  };

  it("차단 모달에 대상 유저 소유 RSS 목록과 토글을 표시해야 한다", async () => {
    mockCertifiedRss.mockReturnValue({
      data: [{ id: 10, name: "seok.log", blogPlatform: "velog" }],
    });
    render(<ProfileHeader name="민석" email="" profileImage={null} introduction={null} blockableUserId={2} />);

    await openBlockModal();

    expect(await screen.findByText("함께 차단할 RSS")).toBeInTheDocument();
    expect(screen.getByText("seok.log")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "seok.log 차단" })).toBeInTheDocument();
  });

  it("토글 ON된 RSS는 유저와 함께 차단되어야 한다", async () => {
    mockCertifiedRss.mockReturnValue({
      data: [
        { id: 10, name: "on.log", blogPlatform: "velog" },
        { id: 20, name: "off.log", blogPlatform: "tistory" },
      ],
    });
    render(<ProfileHeader name="민석" email="" profileImage={null} introduction={null} blockableUserId={2} />);

    const user = await openBlockModal();
    await user.click(screen.getByRole("switch", { name: "on.log 차단" }));
    await user.click(screen.getByRole("button", { name: "차단" }));

    await waitFor(() => expect(mockBlockUser).toHaveBeenCalledWith(2));
    expect(mockBlockRss).toHaveBeenCalledTimes(1);
    expect(mockBlockRss).toHaveBeenCalledWith(10);
  });

  it("'모두 선택'은 전체 RSS를 켜고 유저와 함께 차단해야 한다", async () => {
    mockCertifiedRss.mockReturnValue({
      data: [
        { id: 10, name: "a.log", blogPlatform: "velog" },
        { id: 20, name: "b.log", blogPlatform: "tistory" },
      ],
    });
    render(<ProfileHeader name="민석" email="" profileImage={null} introduction={null} blockableUserId={2} />);

    const user = await openBlockModal();
    await user.click(await screen.findByRole("button", { name: "모두 선택" }));

    expect(screen.getByRole("switch", { name: "a.log 차단" })).toBeChecked();
    expect(screen.getByRole("switch", { name: "b.log 차단" })).toBeChecked();
    expect(screen.getByRole("button", { name: "모두 해제" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "차단" }));

    await waitFor(() => expect(mockBlockRss).toHaveBeenCalledTimes(2));
    expect(mockBlockRss).toHaveBeenCalledWith(10);
    expect(mockBlockRss).toHaveBeenCalledWith(20);
  });

  it("'모두 해제'는 전체 RSS 토글을 끈다", async () => {
    mockCertifiedRss.mockReturnValue({
      data: [{ id: 10, name: "a.log", blogPlatform: "velog" }],
    });
    render(<ProfileHeader name="민석" email="" profileImage={null} introduction={null} blockableUserId={2} />);

    const user = await openBlockModal();
    await user.click(await screen.findByRole("button", { name: "모두 선택" }));
    await user.click(screen.getByRole("button", { name: "모두 해제" }));

    expect(screen.getByRole("switch", { name: "a.log 차단" })).not.toBeChecked();
  });

  it("토글하지 않으면 유저만 차단하고 RSS는 차단하지 않아야 한다", async () => {
    mockCertifiedRss.mockReturnValue({
      data: [{ id: 10, name: "on.log", blogPlatform: "velog" }],
    });
    render(<ProfileHeader name="민석" email="" profileImage={null} introduction={null} blockableUserId={2} />);

    const user = await openBlockModal();
    await user.click(screen.getByRole("button", { name: "차단" }));

    await waitFor(() => expect(mockBlockUser).toHaveBeenCalledWith(2));
    expect(mockBlockRss).not.toHaveBeenCalled();
  });
});
