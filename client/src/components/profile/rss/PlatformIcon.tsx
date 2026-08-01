import { Rss } from "lucide-react";

const KNOWN_PLATFORMS = ["tistory", "velog", "medium", "naver"];

interface PlatformIconProps {
  platform: string;
  image?: string | null;
  className?: string;
  alt?: string;
}

export const PlatformIcon = ({ platform, image, className = "w-5 h-5", alt }: PlatformIconProps) => {
  const altText = alt ?? platform;

  if (image) {
    return <img src={image} alt={altText} className={`${className} rounded-full object-cover`} />;
  }

  const key = platform.toLowerCase().replace(" ", "_");

  if (KNOWN_PLATFORMS.includes(key)) {
    return <img src={`https://denamu.dev/files/${key}-icon.svg`} alt={altText} className={className} />;
  }

  return <Rss className={`${className} text-blue-500`} />;
};
