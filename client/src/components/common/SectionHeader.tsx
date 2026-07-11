import clsx from "clsx";
import { LucideIcon } from "lucide-react";

import { usePostTypeStore } from "@/store/usePostTypeStore";

type PostType = "latest" | "recommend" | "subscribe";

interface SectionHeaderProps {
  icon: LucideIcon;
  text: string;
  iconColor: string;
  description: string;
  secondText?: string;
  secondDescription?: string;
  thirdText?: string;
  thirdDescription?: string;
}

export const SectionHeader = ({
  icon: Icon,
  text,
  iconColor,
  description,
  secondText,
  secondDescription,
  thirdText,
  thirdDescription,
}: SectionHeaderProps) => {
  const { postType, setPostType } = usePostTypeStore();

  const isToggle = !!secondText;

  const activeDescription = !isToggle
    ? description
    : postType === "latest"
      ? description
      : postType === "recommend"
        ? secondDescription
        : thirdDescription;

  const heading = (label: string, type: PostType, onClick: () => void) => (
    <h2
      className={clsx(
        "text-lg md:text-xl font-semibold",
        isToggle && postType !== type && "text-gray-400 cursor-pointer hover:text-black"
      )}
      onClick={isToggle ? onClick : undefined}
    >
      {label}
    </h2>
  );

  return (
    <div className="whitespace-nowrap flex items-center gap-2 p-4 md:p-0">
      {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}

      {heading(text, "latest", () => setPostType("latest"))}
      {secondText && heading(secondText, "recommend", () => setPostType("recommend"))}
      {thirdText && heading(thirdText, "subscribe", () => setPostType("subscribe"))}

      <p className="text-xs md:text-sm text-gray-400 mt-1">{activeDescription}</p>
    </div>
  );
};
