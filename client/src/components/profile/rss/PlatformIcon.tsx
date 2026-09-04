import { Rss } from "lucide-react";

const KNOWN_PLATFORMS = ["tistory", "velog", "medium", "naver", "github"];

interface PlatformIconProps {
  platform: string;
  image?: string | null;
  name?: string;
  className?: string;
  alt?: string;
}

export const PlatformIcon = ({ platform, image, name, className = "w-5 h-5", alt }: PlatformIconProps) => {
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

  if (name) {
    return (
      <div
        role="img"
        aria-label={altText}
        className={`${className} rounded-full bg-muted flex items-center justify-center font-medium text-muted-foreground`}
      >
        {name.substring(0, 2).toUpperCase()}
      </div>
    );
  }

  return <Rss className={`${className} text-blue-500`} />;
};
