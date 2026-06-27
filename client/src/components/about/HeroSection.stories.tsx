import type { Meta, StoryObj } from "@storybook/react-vite";
import { action } from "storybook/actions";

import { HeroSection } from "@/components/about/HeroSection";

const meta = {
  title: "about/HeroSection",
  component: HeroSection,
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
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
