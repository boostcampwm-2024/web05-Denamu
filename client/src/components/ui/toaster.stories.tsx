import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";

import { Toaster } from "@/components/ui/toaster";
import { toast as fireToast } from "@/hooks/common/useCustomToast";
import { Button } from "@/components/ui/button";

const meta = {
  title: "ui/Toaster",
  component: Toaster,
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

const ToastTrigger = () => {
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={() => fireToast({ title: "성공", description: "RSS 피드가 등록되었습니다." })}>
        성공 토스트
      </Button>
      <Button variant="destructive" onClick={() => fireToast({ title: "오류", description: "요청을 처리할 수 없습니다.", variant: "destructive" })}>
        오류 토스트
      </Button>
      <Toaster />
    </div>
  );
};

export const Default: Story = {
  render: () => <ToastTrigger />,
};

const AutoToast = () => {
  useEffect(() => {
    fireToast({ title: "알림", description: "RSS 피드가 성공적으로 등록되었습니다." });
  }, []);
  return <Toaster />;
};

export const AutoShow: Story = {
  name: "자동 표시",
  render: () => <AutoToast />,
};
