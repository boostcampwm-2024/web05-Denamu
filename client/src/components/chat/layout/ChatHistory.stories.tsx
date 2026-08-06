import ChatHistory from "@/components/chat/layout/ChatHistory";

import { useChatStore } from "@/store/useChatStore";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

const meta = {
  title: "chat/layout/ChatHistory",
  component: ChatHistory,
  args: { isFull: false, isConnected: true },
} satisfies Meta<typeof ChatHistory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disconnected: Story = {
  args: { isConnected: false, onReconnect: fn() },
  // isLoading은 store 전역 상태라 args로 제어 안 됨. 실제 disconnect 화면 확인을 위해 강제로 false 처리.
  play: async () => {
    useChatStore.setState({ isLoading: false });
  },
};
