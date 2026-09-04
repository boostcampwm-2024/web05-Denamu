import { useLayoutEffect, useRef, useState } from "react";

import { RssRegistrationModal } from "@/components/RssRegistration/RssRegistrationModal";
import DesktopNavigation from "@/components/layout/navigation/DesktopNavigation";
import MobileNavigation from "@/components/layout/navigation/MobileNavigation";
import SearchModal from "@/components/search/SearchModal";

import { useKeyboardShortcut } from "@/hooks/common/useKeyboardShortcut";

import { useMediaStore } from "@/store/useMediaStore";

export default function Header() {
  const [modals, setModals] = useState({ search: false, rss: false, login: false, chat: false });
  const isMobile = useMediaStore((state) => state.isMobile);
  const headerRef = useRef<HTMLDivElement>(null);

  const toggleModal = (modalType: "search" | "rss" | "chat") => {
    setModals((prev) => ({ ...prev, [modalType]: !prev[modalType] }));
  };

  useKeyboardShortcut("k", () => toggleModal("search"), true);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const setHeaderHeightVar = () => {
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    };

    setHeaderHeightVar();
    const observer = new ResizeObserver(setHeaderHeightVar);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile]);

  return (
    <div ref={headerRef} className="sticky top-0 z-30 bg-white border-b border-primary/20">
      {isMobile ? <MobileNavigation toggleModal={toggleModal} /> : <DesktopNavigation toggleModal={toggleModal} />}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"></div>
      {modals.rss && <RssRegistrationModal onClose={() => toggleModal("rss")} rssOpen={modals.rss} />}
      {modals.search && <SearchModal onClose={() => toggleModal("search")} />}
    </div>
  );
}
