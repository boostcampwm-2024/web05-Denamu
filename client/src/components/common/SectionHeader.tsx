import clsx from "clsx";
import { LucideIcon } from "lucide-react";

import { usePostTypeStore } from "@/store/usePostTypeStore";

interface SectionHeaderProps {
  icon: LucideIcon;
  text: string;
  iconColor: string;
  description: string;
  secondText?: string;
  secondDescription?: string;
}

export const SectionHeader = ({
  icon: Icon,
  text,
  iconColor,
  description,
  secondText,
  secondDescription,
}: SectionHeaderProps) => {
  const { postType, setPostType } = usePostTypeStore();

  const hasSecond = !secondText || postType === "latest";

  return (
    <div className="whitespace-nowrap flex items-center gap-2 p-4 md:p-0">
      {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}

      <h2
        className={clsx(
          "text-xl font-semibold",
          secondText && postType !== "latest" && "text-gray-400 cursor-pointer hover:text-black"
        )}
        onClick={() => secondText && setPostType("latest")}
      >
        {text}
      </h2>

      {secondText && (
        <h2
          className={clsx(
            "text-xl font-semibold",
            postType !== "recommend" && "text-gray-400 cursor-pointer hover:text-black"
          )}
          onClick={() => setPostType("recommend")}
        >
          {secondText}
        </h2>
      )}

      <p className="text-sm text-gray-400 mt-1">{hasSecond ? description : secondDescription}</p>
    </div>
  );
};
