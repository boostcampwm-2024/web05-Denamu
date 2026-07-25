import { vi } from "vitest";

const DEFAULT_VALUES = {
  email: "",
  userName: "",
  bloggerName: "",
  blogUrl: "",
  addressInput: "",
  blogPlatform: "",
};

const DEFAULT_SUCCESS_VALUES = {
  email: "test@example.com",
  userName: "테스트",
  bloggerName: "블로그",
  blogUrl: "https://test.tistory.com",
  addressInput: "test",
  blogPlatform: "tistory",
};

const DEFAULT_FORM_STATE = {
  selectedPlatformValue: "",
  addressTemplate: null,
  values: DEFAULT_VALUES,
  handlers: {
    handleEmail: vi.fn(),
    handleUserName: vi.fn(),
    handleBloggerName: vi.fn(),
    handlePlatformSelection: vi.fn(),
    handleAddressInputChange: vi.fn(),
    handleRssDirectInput: vi.fn(),
  },
  formState: {
    isValid: true,
    reset: vi.fn(),
  },
};

export const PLATFORM_OPTIONS = [
  { value: "tistory", label: "Tistory" },
  { value: "velog", label: "Velog" },
  { value: "medium", label: "Medium" },
  { value: "github", label: "GitHub" },
  { value: "naver", label: "Naver" },
  { value: "etc", label: "기타" },
];

export const mockUseRssRegistrationForm = {
  useRssRegistrationForm: vi.fn().mockReturnValue(DEFAULT_FORM_STATE),
  PLATFORM_OPTIONS,
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
      blogUrl: "invalid-url", // 잘못된 URL 형식
      addressInput: "asdf",
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
