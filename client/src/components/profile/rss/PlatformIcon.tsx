import { Rss } from "lucide-react";

const KNOWN_PLATFORMS = ["tistory", "velog", "medium", "naver"];

interface PlatformIconProps {
  platform: string;
  className?: string;
}

export const PlatformIcon = ({ platform, className = "w-5 h-5" }: PlatformIconProps) => {
  const key = platform.toLowerCase().replace(" ", "_");

  if (KNOWN_PLATFORMS.includes(key)) {
    return <img src={`https://denamu.dev/files/${key}-icon.svg`} alt={platform} className={className} />;
  }

  return <Rss className={`${className} text-blue-500`} />;
};
