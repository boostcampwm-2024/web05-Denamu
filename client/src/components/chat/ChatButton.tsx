import { MessageCircleMore } from "lucide-react";

import { NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";

export default function ChatButton() {
  return (
    <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
      <div className="flex items-center gap-2">
        <MessageCircleMore size={16} />
        <span>채팅</span>
      </div>
    </NavigationMenuLink>
  );
}
