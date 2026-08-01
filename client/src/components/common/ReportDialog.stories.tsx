import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { ReportDialog } from "@/components/common/ReportDialog";
import { CreateReportPayload } from "@/types/report";

const meta = {
  title: "common/ReportDialog",
  component: ReportDialog,
  args: {
    open: true,
    onOpenChange: () => {},
    title: "게시글 신고",
    isPending: false,
    onSubmit: () => {},
  },
} satisfies Meta<typeof ReportDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return <ReportDialog {...args} open={open} onOpenChange={setOpen} />;
  },
};

export const Pending: Story = {
  name: "제출 중",
  args: { isPending: true },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return <ReportDialog {...args} open={open} onOpenChange={setOpen} />;
  },
};

export const SubmitFlow: Story = {
  name: "사유 선택 후 제출",
  render: (args) => {
    const [open, setOpen] = useState(true);
    const [submitted, setSubmitted] = useState<CreateReportPayload | null>(null);
    return (
      <div>
        <ReportDialog {...args} open={open} onOpenChange={setOpen} onSubmit={(payload) => setSubmitted(payload)} />
        {submitted && <p data-testid="submitted-payload">{JSON.stringify(submitted)}</p>}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(await body.findByRole("button", { name: "신고하기" })).toBeDisabled();

    await userEvent.click(await body.findByRole("combobox"));
    await userEvent.click(await body.findByRole("option", { name: "스팸/광고" }));
    await userEvent.type(await body.findByPlaceholderText("신고 사유에 대해 자세히 설명해주세요."), "반복 광고 댓글");
    await userEvent.click(await body.findByRole("button", { name: "신고하기" }));

    await waitFor(() => expect(canvas.getByTestId("submitted-payload")).toHaveTextContent("SPAM"));
    await expect(canvas.getByTestId("submitted-payload")).toHaveTextContent("반복 광고 댓글");
  },
};

export const Cancel: Story = {
  name: "취소하면 닫힌다",
  render: (args) => {
    const [open, setOpen] = useState(true);
    return <ReportDialog {...args} open={open} onOpenChange={setOpen} />;
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await body.findByRole("button", { name: "취소" }));

    await waitFor(() => expect(body.queryByRole("button", { name: "취소" })).not.toBeInTheDocument());
  },
};
