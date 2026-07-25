import { PlatformIcon } from "@/components/profile/rss/PlatformIcon";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const KNOWN_PLATFORMS = ["tistory", "velog", "medium", "naver"];

type AvatarType = {
  author: string;
  className: string;
  blogPlatform: string;
  blogImage?: string | null;
};

export default function PostAvatar({ author, className, blogPlatform, blogImage }: AvatarType) {
  const authorInitial = author?.charAt(0)?.toUpperCase() || "?";
  const hasVisual = Boolean(blogImage) || KNOWN_PLATFORMS.includes(blogPlatform.toLowerCase());

  return (
    <Avatar className="h-8 w-8 ring-2 ring-background cursor-pointer">
      {hasVisual ? (
        <PlatformIcon platform={blogPlatform} image={blogImage} className={className} alt={author} />
      ) : (
        <AvatarFallback className="text-xs bg-slate-200">{authorInitial}</AvatarFallback>
      )}
    </Avatar>
  );
}
