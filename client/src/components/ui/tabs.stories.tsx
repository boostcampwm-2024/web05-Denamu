import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const meta = {
  title: "ui/Tabs",
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="pending" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="pending">대기중</TabsTrigger>
        <TabsTrigger value="accepted">승인됨</TabsTrigger>
        <TabsTrigger value="rejected">거절됨</TabsTrigger>
      </TabsList>
      <TabsContent value="pending">
        <p className="text-sm text-muted-foreground py-4">승인 대기 중인 RSS 피드 목록입니다.</p>
      </TabsContent>
      <TabsContent value="accepted">
        <p className="text-sm text-muted-foreground py-4">승인된 RSS 피드 목록입니다.</p>
      </TabsContent>
      <TabsContent value="rejected">
        <p className="text-sm text-muted-foreground py-4">거절된 RSS 피드 목록입니다.</p>
      </TabsContent>
    </Tabs>
  ),
};
