import TrandingSection from "@/components/sections/TrendingSection";
import LatestSection from "@/components/sections/LatestSection";

export default function MainContent() {
  return (
    <div className="flex flex-col p-8 gap-8">
      <TrandingSection />
      <LatestSection />
    </div>
  );
}