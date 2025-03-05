import { vi } from "vitest";

const DEFAULT_VALUES = {
  email: "",
  userName: "",
  bloggerName: "",
  rssUrl: "",
  urlUsername: "",
};

const DEFAULT_SUCCESS_VALUES = {
  email: "test@example.com",
  userName: "테스트",
  bloggerName: "블로그",
  rssUrl: "https://test.com/rss",
  urlUsername: "test",
};

const DEFAULT_FORM_STATE = {
  platform: "tistory",
  values: DEFAULT_VALUES,
  handlers: {
    handleEmail: vi.fn(),
    handleUserName: vi.fn(),
    handleBloggerName: vi.fn(),
    handlePlatformChange: vi.fn(),
    handleUsernameChange: vi.fn(),
  },
  formState: {
    isValid: true,
    reset: vi.fn(),
  },
};

export const mockUseRssRegistrationForm = {
  useRssRegistrationForm: vi.fn().mockReturnValue(DEFAULT_FORM_STATE),
};

export const createFormMock = ({ values = DEFAULT_VALUES, isValid = true, reset = vi.fn() } = {}) => {
  return vi.mocked(mockUseRssRegistrationForm.useRssRegistrationForm).mockReturnValue({
    ...DEFAULT_FORM_STATE,
    values,
    formState: {
      isValid,
      reset,
    },
  });
};

export const createSuccessFormMock = (reset = vi.fn()) => {
  return createFormMock({
    values: DEFAULT_SUCCESS_VALUES,
    reset,
  });
};

export const createFailureFormMock = () => {
  return createFormMock({
    values: {
      ...DEFAULT_VALUES,
      email: "invalid-email", // 잘못된 이메일 형식
      userName: "asdf", // 빈 값
      bloggerName: "asdf", // 빈 값
      rssUrl: "invalid-url", // 잘못된 URL 형식
      urlUsername: "asdf",
    },
    isValid: false,
  });
};

export const createFormMockWithReset = () => {
  const resetMock = vi.fn();
  return {
    ...createFormMock({
      values: DEFAULT_SUCCESS_VALUES,
      reset: resetMock,
    }),
    resetMock,
  };
};
