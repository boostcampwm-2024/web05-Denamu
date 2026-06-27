import type { Meta, StoryObj } from "@storybook/react-vite";

import AcceptedTab from "@/components/admin/tabs/AcceptedTab";
import { Tabs } from "@/components/ui/tabs";
import { mockAdminRssList } from "@/__storybook__/fixtures";

const meta = {
  title: "admin/tabs/AcceptedTab",
  component: AcceptedTab,
  decorators: [
    (Story) => (
        <Tabs defaultValue="accepted">
        <Story />
        </Tabs>
    ),
  ],
  args: { data: mockAdminRssList },
} satisfies Meta<typeof AcceptedTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
