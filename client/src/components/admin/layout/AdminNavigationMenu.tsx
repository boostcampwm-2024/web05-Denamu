import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";

export const TAB_TYPES = {
  RSS: "RSS",
  MEMBER: "MEMBER",
  POST: "POST",
  CHAT: "CHAT",
  REPORT: "REPORT",
  BOARD: "BOARD",
  QNA: "QNA",
} as const;

type TabType = (typeof TAB_TYPES)[keyof typeof TAB_TYPES];

export const AdminNavigationMenu = ({ handleTap }: { handleTap: (tabType: TabType) => void }) => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Button variant="ghost" className="w-full justify-start" onClick={() => handleTap("RSS")}>
            RSS 목록
          </Button>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Button variant="ghost" className="w-full justify-start" onClick={() => handleTap("MEMBER")}>
            회원 관리
          </Button>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Button variant="ghost" className="w-full justify-start" onClick={() => handleTap("POST")}>
            게시글 관리
          </Button>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Button variant="ghost" className="w-full justify-start" onClick={() => handleTap("CHAT")}>
            채팅 관리
          </Button>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Button variant="ghost" className="w-full justify-start" onClick={() => handleTap("REPORT")}>
            신고 관리
          </Button>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Button variant="ghost" className="w-full justify-start" onClick={() => handleTap("BOARD")}>
            공지사항 · FAQ 관리
          </Button>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Button variant="ghost" className="w-full justify-start" onClick={() => handleTap("QNA")}>
            Q&A 관리
          </Button>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
