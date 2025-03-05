import { LucideIcon } from "lucide-react";

interface ProfileSidebarItemProps {
  icon: LucideIcon;
  label: string;
  id: string;
}

export const Item = ({ icon: Icon, label, id }: ProfileSidebarItemProps) => {
  const scrollToSection = (sectionId: string) => {
    if (sectionId === "profile") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button
      onClick={() => scrollToSection(id)}
      className="flex items-center w-full p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{label}</span>
    </button>
  );
};
