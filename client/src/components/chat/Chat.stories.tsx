import type { Meta, StoryObj } from "@storybook/react-vite";

import { Chat } from "@/components/chat/Chat";
import { SidebarProvider } from "@/components/ui/sidebar";

const meta = {
  title: "chat/Chat",
  component: Chat,
  decorators: [
    (Story) => (
        <SidebarProvider>
        <Story />
        </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof Chat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
