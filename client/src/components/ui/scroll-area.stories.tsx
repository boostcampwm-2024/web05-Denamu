import type { Meta, StoryObj } from "@storybook/react-vite";

import { ScrollArea } from "@/components/ui/scroll-area";

const meta = {
  title: "ui/ScrollArea",
  component: ScrollArea,
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = Array.from({ length: 20 }, (_, i) => `블로그 포스트 #${i + 1} - Storybook 데모`);

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-[300px] w-[360px] rounded-md border p-4">
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="text-sm py-2 border-b last:border-0">
            {item}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};
