import { AuthSection } from "./sidebar/AuthSection";
import { ChatSection } from "./sidebar/ChatSection";
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
      <AuthSection onAction={handleSidebar} />
      <ChatSection />
      <RssButton onRssClick={handleRssModal} onAction={handleSidebar} />
    </div>
  );
}
