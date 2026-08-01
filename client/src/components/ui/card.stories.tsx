import type { Meta, StoryObj } from "@storybook/react-vite";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const meta = {
  title: "ui/Card",
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>데나무 블로그</CardTitle>
        <CardDescription>기술 블로그 RSS 피드 서비스</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">개발자 블로그 콘텐츠를 한 곳에서 모아 볼 수 있는 서비스입니다.</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline">취소</Button>
        <Button>등록하기</Button>
      </CardFooter>
    </Card>
  ),
};
