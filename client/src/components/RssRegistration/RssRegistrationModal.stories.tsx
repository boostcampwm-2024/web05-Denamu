import { RssRegistrationModal } from "@/components/RssRegistration/RssRegistrationModal";

import { BLOG } from "@/constants/endpoints";

import { fail, mockApi, ok } from "@/__storybook__/mockApi";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

const meta = {
  title: "RssRegistration/RssRegistrationModal",
  component: RssRegistrationModal,
  args: { onClose: fn(), rssOpen: true },
} satisfies Meta<typeof RssRegistrationModal>;

export default meta;
type Story = StoryObj<typeof meta>;

// RssRegistrationModal의 Dialog/AlertDialog는 Radix Portal로 document.body에 렌더링되어
// canvasElement 밖에 위치함 -> 모든 조회는 body 기준으로 수행해야 함.
const fillForm = async (canvasElement: HTMLElement) => {
  const body = within(canvasElement.ownerDocument.body);

  await userEvent.click(body.getByRole("combobox"));
  await userEvent.click(await body.findByRole("option", { name: "Tistory" }));

  await userEvent.type(body.getByPlaceholderText("서브도메인"), "myblog");
  await userEvent.type(body.getByRole("textbox", { name: "블로그명" }), "테스트 블로그");
  await userEvent.type(body.getByRole("textbox", { name: "신청자 이름" }), "테스터");
  await userEvent.type(body.getByRole("textbox", { name: "이메일" }), "test@example.com");
};

const submitAndGetAlert = async (canvasElement: HTMLElement) => {
  const body = within(canvasElement.ownerDocument.body);
  await userEvent.click(body.getByRole("button", { name: "등록" }));
  return body.findByTestId("alert-dialog");
};

export const Default: Story = {
  beforeEach: () => {
    mockApi.onPost(BLOG.RSS.REGISTRER_RSS).reply(...ok(null));
  },
};

export const RegisterSuccess: Story = {
  name: "등록 성공",
  beforeEach: () => {
    mockApi.onPost(BLOG.RSS.REGISTRER_RSS).reply(...ok(null));
  },
  play: async ({ canvasElement }) => {
    await fillForm(canvasElement);
    const alert = await submitAndGetAlert(canvasElement);
    await expect(within(alert).getByText("RSS 요청 성공!")).toBeInTheDocument();
  },
};

export const RegisterInvalidBlogUrl: Story = {
  name: "블로그 주소를 찾을 수 없음(404)",
  beforeEach: () => {
    mockApi.onPost(BLOG.RSS.REGISTRER_RSS).reply(...fail(404, "블로그 주소를 찾을 수 없습니다."));
  },
  play: async ({ canvasElement }) => {
    await fillForm(canvasElement);
    const alert = await submitAndGetAlert(canvasElement);
    await expect(within(alert).getByText("블로그 주소를 확인해주세요!")).toBeInTheDocument();
  },
};

export const RegisterFailure: Story = {
  name: "등록 실패(서버 오류)",
  beforeEach: () => {
    mockApi.onPost(BLOG.RSS.REGISTRER_RSS).reply(...fail(500));
  },
  play: async ({ canvasElement }) => {
    await fillForm(canvasElement);
    const alert = await submitAndGetAlert(canvasElement);
    await expect(within(alert).getByText("RSS 요청 실패!")).toBeInTheDocument();
  },
};
