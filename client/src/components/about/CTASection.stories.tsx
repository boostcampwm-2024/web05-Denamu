import type { Meta, StoryObj } from "@storybook/react-vite";
import { action } from "storybook/actions";

import { CTASection } from "@/components/about/CTASection";

const meta = {
  title: "about/CTASection",
  component: CTASection,
  decorators: [
    (Story) => (
      <div
        onClickCapture={(e) => {
          const button = (e.target as HTMLElement).closest("button");
          if (button) action(button.textContent?.trim() || "button 클릭")(e);
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CTASection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
