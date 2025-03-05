import { useState } from "react";

import { RssRegistrationModal } from "@/components/RssRegistration/RssRegistrationModal";
import DesktopNavigation from "@/components/layout/navigation/DesktopNavigation";
import MobileNavigation from "@/components/layout/navigation/MobileNavigation";
import SearchModal from "@/components/search/SearchModal";

import { useKeyboardShortcut } from "@/hooks/common/useKeyboardShortcut";

import { useMediaStore } from "@/store/useMediaStore";

export default function Header() {
  const [modals, setModals] = useState({ search: false, rss: false, login: false, chat: false });
  const isMobile = useMediaStore((state) => state.isMobile);

  const toggleModal = (modalType: "search" | "rss" | "chat") => {
    setModals((prev) => ({ ...prev, [modalType]: !prev[modalType] }));
  };

  useKeyboardShortcut("k", () => toggleModal("search"), true);

  return (
    <div className="border-b border-primary/20">
      {isMobile ? <MobileNavigation toggleModal={toggleModal} /> : <DesktopNavigation toggleModal={toggleModal} />}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"></div>
      {modals.rss && <RssRegistrationModal onClose={() => toggleModal("rss")} rssOpen={modals.rss} />}
      {modals.search && <SearchModal onClose={() => toggleModal("search")} />}
    </div>
  );
}
