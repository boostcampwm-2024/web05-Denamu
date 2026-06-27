import { beforeEach, describe, expect, it, vi } from "vitest";

import { RssClaimModal } from "@/components/profile/rss/RssClaimModal.tsx";

import { fireEvent, render, screen } from "@testing-library/react";

const mockToast = vi.fn();

// 각 mutation 은 전달된 콜백(onSuccess/onError)을 즉시 호출해 단계 전환을 검증한다.
let previewImpl: (name: string, opts: { onSuccess: (d: unknown) => void; onError: (e: unknown) => void }) => void;
let createImpl: (name: string, opts: { onSuccess: (r: { certified: boolean }) => void; onError: (e: unknown) => void }) => void;
let verifyImpl: (code: string, opts: { onSuccess: () => void; onError: (e: unknown) => void }) => void;

vi.mock("@/hooks/common/useCustomToast.ts", () => ({ useCustomToast: () => ({ toast: mockToast }) }));
vi.mock("@/hooks/queries/useRssCertification.ts", () => ({
  useRssCertificationPreview: () => ({ mutate: (n: string, o: never) => previewImpl(n, o), isPending: false }),
  useCreateRssCertification: () => ({ mutate: (n: string, o: never) => createImpl(n, o), isPending: false }),
  useVerifyRssCertification: () => ({ mutate: (c: string, o: never) => verifyImpl(c, o), isPending: false }),
}));
vi.mock("@/components/profile/rss/PlatformIcon.tsx", () => ({ PlatformIcon: () => <div /> }));

const previewData = {
  name: "내 블로그",
  userName: "주인",
  rssUrl: "https://blog.test/rss",
  blogPlatform: "velog",
  requiresEmailVerification: true,
};

const goToPreview = () => {
  fireEvent.change(screen.getByLabelText("블로그 이름"), { target: { value: "내 블로그" } });
  fireEvent.click(screen.getByRole("button", { name: "확인" }));
};

describe("RssClaimModal flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    previewImpl = (_n, o) => o.onSuccess(previewData);
    createImpl = (_n, o) => o.onSuccess({ certified: false });
    verifyImpl = (_c, o) => o.onSuccess();
  });

  it("이름 입력 후 확인하면 미리보기 단계로 전환된다", () => {
    render(<RssClaimModal open onClose={vi.fn()} userId={1} />);

    goToPreview();

    expect(screen.getByText("RSS 정보 확인")).toBeInTheDocument();
    expect(screen.getByText("내 블로그")).toBeInTheDocument();
    expect(screen.getByText(/2차 인증이 필요/)).toBeInTheDocument();
  });

  it("미리보기에서 뒤로 가면 입력 단계로 돌아간다", () => {
    render(<RssClaimModal open onClose={vi.fn()} userId={1} />);
    goToPreview();

    fireEvent.click(screen.getByRole("button", { name: "뒤로" }));

    expect(screen.getByText("RSS 소유 등록")).toBeInTheDocument();
  });

  it("미리보기 확인 시 certified=false면 인증 코드 입력 단계로 전환된다", () => {
    render(<RssClaimModal open onClose={vi.fn()} userId={1} />);
    goToPreview();

    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(screen.getByText("이메일 인증")).toBeInTheDocument();
    expect(screen.getByLabelText("인증 코드")).toBeInTheDocument();
  });

  it("미리보기 확인 시 certified=true면 완료 toast 후 닫힌다", () => {
    createImpl = (_n, o) => o.onSuccess({ certified: true });
    const onClose = vi.fn();
    render(<RssClaimModal open onClose={onClose} userId={1} />);
    goToPreview();

    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "등록 완료" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("인증 코드 입력 후 인증하면 완료 toast 후 닫힌다", () => {
    const onClose = vi.fn();
    render(<RssClaimModal open onClose={onClose} userId={1} />);
    goToPreview();
    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    fireEvent.change(screen.getByLabelText("인증 코드"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "인증" }));

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "인증 완료" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("미리보기 조회 실패 시 실패 toast 를 띄운다", () => {
    previewImpl = (_n, o) => o.onError({ response: { data: { message: "찾을 수 없음" } } });
    render(<RssClaimModal open onClose={vi.fn()} userId={1} />);

    goToPreview();

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "조회 실패" }));
  });
});
