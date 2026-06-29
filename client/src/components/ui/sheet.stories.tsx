import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const meta = {
  title: "ui/Sheet",
  component: Sheet,
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sheet defaultOpen>
      <SheetTrigger asChild>
        <Button variant="outline">사이드 패널 열기</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>메뉴</SheetTitle>
          <SheetDescription>사이드 패널 내용입니다.</SheetDescription>
        </SheetHeader>
        <div className="py-4 text-sm text-muted-foreground">내용이 여기에 들어갑니다.</div>
      </SheetContent>
    </Sheet>
  ),
};
