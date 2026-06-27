import type { Meta, StoryObj } from "@storybook/react-vite";

import ChatHeader from "@/components/chat/layout/ChatHeader";
import { SidebarProvider } from "@/components/ui/sidebar";

const meta = {
  title: "chat/layout/ChatHeader",
  component: ChatHeader,
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof ChatHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
