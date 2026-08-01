import { DEFAULT_BADGE_COLOR, PLATFORM_BADGE_COLORS } from "@/constants/rss";

interface BlogPlatformBadgeProps {
  platform: string;
  className?: string;
}

export const BlogPlatformBadge = ({ platform, className = "" }: BlogPlatformBadgeProps) => (
  <span
    className={`px-2 py-0.5 text-[10px] text-white rounded-full truncate ${className}`}
    style={{ backgroundColor: PLATFORM_BADGE_COLORS[platform.toLowerCase()] ?? DEFAULT_BADGE_COLOR }}
  >
    {platform}
  </span>
);
