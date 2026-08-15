import { AuthSection } from "./sidebar/AuthSection";
import { ChatSection } from "./sidebar/ChatSection";
import { LogoutButton } from "./sidebar/LogoutButton";
import { NavigationButtons } from "./sidebar/NavigationButtons";
import { RssButton } from "./sidebar/RssButton";

type SideBarType = {
  handleRssModal: () => void;
  handleSidebar: () => void;
};

export default function SideBar({ handleRssModal, handleSidebar }: SideBarType) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <NavigationButtons onAction={handleSidebar} />
      <ChatSection />
      <RssButton onRssClick={handleRssModal} onAction={handleSidebar} />
      <hr className="border-t border-gray-200" />
      <AuthSection onAction={handleSidebar} />
      <LogoutButton />
    </div>
  );
}
