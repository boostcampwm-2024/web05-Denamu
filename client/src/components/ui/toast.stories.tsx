import type { Meta, StoryObj } from "@storybook/react-vite";

import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

const meta = {
  title: "ui/Toast",
  component: Toast,
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <Toast open>
        <div className="grid gap-1">
          <ToastTitle>알림</ToastTitle>
          <ToastDescription>RSS가 성공적으로 등록되었습니다.</ToastDescription>
        </div>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  ),
};
