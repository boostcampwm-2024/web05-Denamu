import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CardContent } from "@/components/ui/card";

import { formatDate } from "@/utils/date";

import { Post } from "@/types/post";

interface PostCardContentProps {
  post: Post;
}

export const PostCardContent = ({ post }: PostCardContentProps) => {
  const authorInitial = post.author?.charAt(0)?.toUpperCase() || "?";
  const data = `https://denamu.site/files/${post.blogPlatform}-icon.svg`;
  return (
    <CardContent className="p-0">
      <div className="relative -mt-6 ml-4 mb-3">
        <Avatar className="h-8 w-8 ring-2 ring-background cursor-pointer">
          {data ? (
            <img src={data} alt={post.author} className="w-full h-full" />
          ) : (
            <AvatarFallback className="text-xs bg-slate-200">{authorInitial}</AvatarFallback>
          )}
        </Avatar>
      </div>
      <div className="px-4 pb-4">
        <p className="font-bold text-xs text-gray-400 pb-1 line-clamp-1">{post.author}</p>
        <p className="h-[40px] font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </p>
        <p className="text-[10px] text-gray-400 pt-2">{formatDate(post.createdAt)}</p>
      </div>
    </CardContent>
  );
};
