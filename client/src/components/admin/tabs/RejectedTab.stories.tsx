import type { Meta, StoryObj } from "@storybook/react-vite";

import RejectedTab from "@/components/admin/tabs/RejectedTab";
import { Tabs } from "@/components/ui/tabs";
import { mockAdminRssList } from "@/__storybook__/fixtures";

const meta = {
  title: "admin/tabs/RejectedTab",
  component: RejectedTab,
  decorators: [
    (Story) => (
      <Tabs defaultValue="rejected">
        <Story />
      </Tabs>
    ),
  ],
  args: { data: mockAdminRssList },
} satisfies Meta<typeof RejectedTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
