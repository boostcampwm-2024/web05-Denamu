import { useNavigate } from "react-router-dom";

import SideButton from "@/components/layout/SideButton";
import SearchButton from "@/components/search/SearchButton";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import logo from "@/assets/logo-denamu-main.svg";

import { useTapStore } from "@/store/useTapStore";

export default function DesktopNavigation({ toggleModal }: { toggleModal: (modalType: "search" | "rss") => void }) {
  const navigate = useNavigate();
  const { setTap } = useTapStore();

  return (
    <div className="h-20 items-center flex justify-between relative px-[20px]">
      <button
        className="flex-shrink-0 relative z-50"
        onClick={() => {
          setTap("main");
          navigate("/");
        }}
      >
        <img className="h-14 w-auto cursor-pointer" src={logo} alt="Logo" />
      </button>

      <div className="absolute left-1/2 transform -translate-x-1/2 w-[25%] flex justify-center z-40">
        <SearchButton handleSearchModal={() => toggleModal("search")} />
      </div>

      <div className="flex items-center z-50">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <SideButton />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={`${navigationMenuTriggerStyle()} hover:text-primary hover:bg-primary/10`}
                onClick={() => navigate("/about")}
                href="#"
              >
                서비스 소개
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                className={`${navigationMenuTriggerStyle()} hover:text-primary hover:bg-primary/10`}
                href="/signin"
              >
                로그인
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button variant="default" onClick={() => toggleModal("rss")} className="bg-primary hover:bg-primary/90">
                블로그 등록
              </Button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
