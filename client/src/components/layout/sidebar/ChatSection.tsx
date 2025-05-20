import { Chat } from "@/components/chat/Chat";
import { OpenChat } from "@/components/chat/ChatButton";
import { SidebarProvider } from "@/components/ui/sidebar";

export const ChatSection = () => {
  return (
    <div className="border border-input bg-background hover:bg-accent hover:text-accent-foreground h-[40px] overflow-hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
      <SidebarProvider>
        <Chat />
        <OpenChat />
      </SidebarProvider>
    </div>
  );
};
