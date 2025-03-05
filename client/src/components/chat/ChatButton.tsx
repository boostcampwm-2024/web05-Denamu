import { MessageCircleMore, X } from "lucide-react";

import { useSidebar } from "@/components/ui/sidebar";

import { useSidebarStore } from "@/store/useSidebarStore";

export default function ChatButton() {
  return <div className="flex items-center gap-2"></div>;
}
export function OpenChat() {
  const { toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => {
            setOpenMobile(true);
          }}
          className="w-full"
        >
          채팅
        </button>
      </>
    );
  }

  return (
    <button
      onClick={toggleSidebar}
      className="fixed text-white bottom-[14.5rem] right-7 bg-[#3498DB] hover:bg-[#2980B9] !rounded-full p-3 side-btn"
    >
      <MessageCircleMore size={25} />
    </button>
  );
}
export function CloseChat() {
  const { toggleSidebar } = useSidebar();
  const { isOpen, setIsOpen } = useSidebarStore();
  return (
    <button
      onClick={() => {
        toggleSidebar();
        if (isOpen) setIsOpen();
      }}
    >
      <X size={16} />
    </button>
  );
}
