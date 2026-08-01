import type { Meta, StoryObj } from "@storybook/react-vite";

import PrivacyPolicy from "@/pages/PrivacyPolicy";

const meta = {
  title: "pages/PrivacyPolicy",
  component: PrivacyPolicy,
} satisfies Meta<typeof PrivacyPolicy>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
