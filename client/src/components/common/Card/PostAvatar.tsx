import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type AvatarType = {
  author: string;
  className: string;
  blogPlatform: string;
};

export default function PostAvatar({ author, className, blogPlatform }: AvatarType) {
  const isValidPlatform = (platform: string): boolean => {
    const validPlatforms = ["tistory", "velog", "medium"];
    return validPlatforms.includes(platform);
  };
  const authorInitial = author?.charAt(0)?.toUpperCase() || "?";

  return (
    <Avatar className="h-8 w-8 ring-2 ring-background cursor-pointer">
      {isValidPlatform(blogPlatform) ? (
        <img src={`https://denamu.site/files/${blogPlatform}-icon.svg`} alt={author} className={className} />
      ) : (
        <AvatarFallback className="text-xs bg-slate-200">{authorInitial}</AvatarFallback>
      )}
    </Avatar>
  );
}
