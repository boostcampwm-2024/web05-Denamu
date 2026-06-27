import type { Meta, StoryObj } from "@storybook/react-vite";

import AboutService from "@/pages/AboutService";

const meta = {
  title: "pages/AboutService",
  component: AboutService,
} satisfies Meta<typeof AboutService>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
