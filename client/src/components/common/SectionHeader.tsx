import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon;
  text: string;
  iconColor: string;
  description: string;
}

export const SectionHeader = ({ icon: Icon, text, iconColor, description }: SectionHeaderProps) => {
  return (
    <div className="flex items-center gap-2 p-4 md:p-0">
      {Icon && (
        <div>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      )}
      <h2 className="text-xl font-semibold">{text}</h2>
      <p className="text-sm text-gray-400 mt-1">{description}</p>
    </div>
  );
};
