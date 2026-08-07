import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Home, ArrowUp, ChartArea } from "lucide-react";

import { Chat } from "@/components/chat/Chat";
import { OpenChat } from "@/components/chat/ChatButton";
import { useSidebar, SidebarProvider } from "@/components/ui/sidebar";

import { useTapStore } from "@/store/useTapStore";

function ChatSidebarEffects() {
  const { open, isMobile, toggleSidebar } = useSidebar();

  useEffect(() => {
    if (open && !isMobile) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "";
    }
    return () => {
      document.body.style.overflowY = "";
    };
  }, [open, isMobile]);

  if (!open || isMobile) return null;

  return <div className="fixed inset-0 z-[9]" onClick={toggleSidebar} />;
}

export default function SideButton() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const { setTap } = useTapStore();
  const navigate = useNavigate();

  return (
    <div className="flex h-full items-center">
      <SidebarProvider defaultOpen={false} className="min-h-0 w-auto">
        <ChatSidebarEffects />
        <Chat />
        <OpenChat />
      </SidebarProvider>
      <button
        className="fixed text-white bottom-[6.5rem] right-7 bg-primary hover:bg-secondary !rounded-full p-3 side-btn"
        onClick={() => {
          setTap("main");
          navigate("/");
        }}
      >
        <Home size={25} />
      </button>
      <button
        className="fixed text-white bottom-[10.5rem] right-7 bg-[#1ABC9C] hover:bg-[#16A085] !rounded-full p-3 side-btn"
        onClick={() => {
          setTap("chart");
          navigate("/");
        }}
      >
        <ChartArea size={25} />
      </button>
      <button
        className="fixed text-white bottom-[2.5rem] right-7 bg-[#9B59B6] hover:bg-[#8E44AD] !rounded-full p-3 side-btn"
        onClick={scrollToTop}
      >
        <ArrowUp size={25} />
      </button>
    </div>
  );
}
