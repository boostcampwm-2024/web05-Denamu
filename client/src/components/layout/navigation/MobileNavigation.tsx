import { useNavigate } from "react-router-dom";

import { Menu, X } from "lucide-react";

import SideBar from "@/components/layout/Sidebar";
import SearchButton from "@/components/search/SearchButton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import logo from "@/assets/logo-denamu-title.svg";

import { useSidebarStore } from "@/store/useSidebarStore";
import { useTapStore } from "@/store/useTapStore";

export default function MobileNavigation({ toggleModal }: { toggleModal: (modalType: "search" | "rss") => void }) {
  const { isOpen, setIsOpen } = useSidebarStore();
  const navigate = useNavigate();
  const { setTap } = useTapStore();

  return (
    <div className="h-20 items-center flex justify-between relative px-[10px]">
      {/* 로고 */}
      <button
        className="flex-shrink-0 relative z-50"
        onClick={() => {
          setTap("main");
          navigate("/");
        }}
      >
        <img className="h-14 w-auto cursor-pointer" src={logo} alt="Logo" />
      </button>

      <div className="absolute left-1/2 transform -translate-x-1/2 w-[50%] flex justify-center z-40">
        <SearchButton handleSearchModal={() => toggleModal("search")} />
      </div>

      <Sheet open={isOpen}>
        <Button variant="outline" size="icon" className="hover:border-primary hover:text-primary" onClick={setIsOpen}>
          <Menu className="h-4 w-4" />
        </Button>
        <SheetContent className="w-full">
          <SheetHeader>
            <SheetTitle className="text-primary">메뉴</SheetTitle>
            <Button
              className="absolute right-2 top-0 rounded-sm opacity-70 bg-transparent text-black active:bg-transparent"
              onClick={setIsOpen}
            >
              <X />
            </Button>
          </SheetHeader>
          <SideBar handleRssModal={() => toggleModal("rss")} handleSidebar={setIsOpen} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
