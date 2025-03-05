import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { Chat } from "../chat/Chat";
import { OpenChat } from "../chat/ChatButton";
import { SidebarProvider } from "../ui/sidebar";
import { useTapStore } from "@/store/useTapStore";

type SideBarType = {
  handleRssModal: () => void;
  handleSidebar: () => void;
};

export default function SideBar({ handleRssModal, handleSidebar }: SideBarType) {
  const navigate = useNavigate();
  const { tap, setTap } = useTapStore();

  const actionAndClose = (fn: () => void) => {
    fn();
    handleSidebar();
  };

  const handleSignIn = () => {
    navigate("/signin");
    handleSidebar();
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Button onClick={() => navigate("/about")} variant="outline">
        서비스 소개
      </Button>
      <Button variant="outline" className="w-full" onClick={handleSignIn}>
        로그인
      </Button>
      {tap === "main" ? (
        <Button variant="outline" onClick={() => actionAndClose(() => setTap("chart"))}>
          차트
        </Button>
      ) : (
        <Button variant="outline" onClick={() => actionAndClose(() => setTap("main"))}>
          홈
        </Button>
      )}
      <div className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-[40px] overflow-hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
        <SidebarProvider>
          <Chat />
          <OpenChat />
        </SidebarProvider>
      </div>
      <Button variant="default" className="w-full bg-primary" onClick={() => actionAndClose(handleRssModal)}>
        블로그 등록
      </Button>
    </div>
  );
}
