import LatestSection from "@/components/sections/LatestSection";
import TrandingSection from "@/components/sections/TrendingSection";

import { useMediaStore } from "@/store/useMediaStore";

export default function MainContent() {
  const isMobile = useMediaStore((state) => state.isMobile);
  return (
    <div className="flex flex-col px-4 md:p-8 md:gap-8">
      <TrandingSection />
      {isMobile && <hr className="border-t-2 border-dotted border-gray-500 my-4 " />}
      <LatestSection />
    </div>
  );
}
