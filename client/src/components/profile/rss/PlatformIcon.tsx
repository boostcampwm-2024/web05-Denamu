import { Rss } from "lucide-react";

const KNOWN_PLATFORMS = ["tistory", "velog", "medium", "naver", "github"];

interface PlatformIconProps {
  platform: string;
  image?: string | null;
  className?: string;
  alt?: string;
}

export const PlatformIcon = ({ platform, image, className = "w-5 h-5", alt }: PlatformIconProps) => {
  const altText = alt ?? platform;
  const key = platform.toLowerCase().replace(" ", "_");
  const fallbackSrc = `https://denamu.dev/files/${key}-icon.svg`;

  if (image) {
    return (
      <img
        src={image}
        alt={altText}
        className={`${className} rounded-full object-cover`}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = fallbackSrc;
        }}
      />
    );
  }

  if (KNOWN_PLATFORMS.includes(key)) {
    return <img src={fallbackSrc} alt={altText} className={className} />;
  }

  return <Rss className={`${className} text-blue-500`} />;
};
