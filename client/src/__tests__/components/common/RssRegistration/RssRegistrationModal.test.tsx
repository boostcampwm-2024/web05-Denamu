import { beforeEach, describe, expect, it, vi } from "vitest";

import { RssRegistrationModal } from "@/components/RssRegistration/RssRegistrationModal";

import {
  mockUseRssRegistrationForm,
  createFormMock,
  createSuccessFormMock,
  createFailureFormMock,
  createFormMockWithReset,
} from "@/__tests__/__mocks__/helpers/rssRegistrationMocks.ts";
import { mockUseRegisterRss } from "@/__tests__/__mocks__/hooks/useRegisterRss.ts";
import { fireEvent, render, screen, within } from "@testing-library/react";

describe("RssRegistrationModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("모든 폼 필드는 레이블과 연결되어 있어야 한다", () => {
    render(<RssRegistrationModal rssOpen={true} onClose={() => {}} />);

    const emailInput = screen.getByRole("textbox", { name: "이메일" });
    expect(emailInput).toBeInTheDocument();

    const blogInput = screen.getByRole("textbox", { name: "블로그명" });
    expect(blogInput).toBeInTheDocument();

    const nameInput = screen.getByRole("textbox", { name: "신청자 이름" });
    expect(nameInput).toBeInTheDocument();
  });

  it("폼 입력값이 변경되면 상태가 업데이트되어야 한다", () => {
    const { handlers } = mockUseRssRegistrationForm.useRssRegistrationForm();

    render(<RssRegistrationModal rssOpen={true} onClose={() => {}} />);

    fireEvent.change(screen.getByRole("textbox", { name: "블로그명" }), {
      target: { value: "테스트 블로그" },
    });

    fireEvent.change(screen.getByRole("textbox", { name: "이메일" }), {
      target: { value: "test@example.com" },
    });

    expect(handlers.handleBloggerName).toHaveBeenCalledWith("테스트 블로그");
    expect(handlers.handleEmail).toHaveBeenCalledWith("test@example.com");
  });

  it("등록 버튼이 렌더링되어야 한다", async () => {
    render(<RssRegistrationModal rssOpen={true} onClose={() => {}} />);
    const registerButton = screen.getByRole("button", { name: "등록" });
    expect(registerButton).toBeInTheDocument();
  });

  it("모든 필수 필드가 채워지면 등록 버튼이 활성화되어야 한다", () => {
    createFormMock();

    render(<RssRegistrationModal rssOpen={true} onClose={() => {}} />);
    const registerButton = screen.getByRole("button", { name: "등록" });
    expect(registerButton).not.toBeDisabled();
  });

  it("필수 필드가 비어있으면 등록 버튼이 비활성화되어야 한다", () => {
    createFormMock({ isValid: false });

    render(<RssRegistrationModal rssOpen={true} onClose={() => {}} />);
    const registerButton = screen.getByRole("button", { name: "등록" });
    expect(registerButton).toBeDisabled();
  });

  it("등록 버튼 클릭시 RSS 등록 요청을 보내야 한다", () => {
    createSuccessFormMock();

    const mutateSpy = vi.fn();
    mockUseRegisterRss.useRegisterRss = () => ({
      mutate: mutateSpy,
    });

    render(<RssRegistrationModal rssOpen={true} onClose={() => {}} />);
    const registerButton = screen.getByRole("button", { name: "등록" });
    fireEvent.click(registerButton);

    expect(mutateSpy).toHaveBeenCalledWith({
      rssUrl: "https://test.com/rss",
      blog: "블로그",
      name: "테스트",
      email: "test@example.com",
    });
  });

  it("등록 성공시 성공 알림이 표시되어야 한다", async () => {
    createSuccessFormMock();
    mockUseRegisterRss.useRegisterRss = (onSuccess) => ({
      mutate: vi.fn(() => {
        onSuccess();
      }),
    });

    render(<RssRegistrationModal rssOpen={true} onClose={() => {}} />);

    const registerButton = screen.getByRole("button", { name: "등록" });
    fireEvent.click(registerButton);

    const alert = await screen.findByTestId("alert-dialog");
    expect(alert).toBeInTheDocument();
  });

  it("등록 실패시 실패 알림이 표시되어야 한다", async () => {
    createSuccessFormMock();
    mockUseRegisterRss.useRegisterRss = (_, onError) => ({
      mutate: vi.fn(() => {
        onError();
      }),
    });

    render(<RssRegistrationModal rssOpen={true} onClose={() => {}} />);

    const registerButton = screen.getByRole("button", { name: "등록" });
    fireEvent.click(registerButton);

    const alert = await screen.findByTestId("alert-dialog");
    expect(alert).toBeInTheDocument();

    const alertTitle = within(alert).getByText("RSS 요청 실패!");
    expect(alertTitle).toBeInTheDocument();

    const alertContent = within(alert).getByText(
      "입력한 정보를 확인하거나 다시 시도해주세요. 문제가 계속되면 관리자에게 문의하세요!"
    );
    expect(alertContent).toBeInTheDocument();
  });

  it("알림 닫기시 폼이 초기화되고 모달이 닫혀야 한다", async () => {
    const onClose = vi.fn();
    const { resetMock } = createFormMockWithReset();

    mockUseRegisterRss.useRegisterRss = (onSuccess) => ({
      mutate: vi.fn(() => {
        onSuccess();
      }),
    });

    render(<RssRegistrationModal rssOpen={true} onClose={onClose} />);

    const registerButton = screen.getByRole("button", { name: "등록" });
    fireEvent.click(registerButton);

    const alert = await screen.findByTestId("alert-dialog");
    expect(alert).toBeInTheDocument();

    const alertCloseButton = screen.getByRole("button", { name: "확인" });
    fireEvent.click(alertCloseButton);

    expect(mockUseRssRegistrationForm.useRssRegistrationForm().formState.reset).toHaveBeenCalled();

    expect(resetMock).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("모달이 열린 상태에서 모든 필수 요소가 렌더링되어야 한다", () => {
    render(<RssRegistrationModal rssOpen={true} onClose={() => {}} />);

    expect(screen.getByText("RSS 등록")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "등록" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "블로그명" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "이메일" })).toBeInTheDocument();
  });

  it("rssOpen이 false일 때 모달이 렌더링되지 않아야 한다", () => {
    render(<RssRegistrationModal rssOpen={false} onClose={() => {}} />);
    expect(screen.queryByText("RSS 등록")).not.toBeInTheDocument();
  });

  it("폼 유효성 검사에 실패하면 등록 버튼이 비활성화되어야 한다", () => {
    createFailureFormMock();

    render(<RssRegistrationModal rssOpen={true} onClose={() => {}} />);
    const registerButton = screen.getByRole("button", { name: "등록" });

    expect(registerButton).toBeDisabled();
  });
});
