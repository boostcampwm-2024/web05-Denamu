import PostAvatar from "@/components/common/Card/PostAvatar";
import PostTag from "@/components/common/Card/PostTag";
import { CardContent } from "@/components/ui/card";

import { formatDate } from "@/utils/date";

import { useMediaStore } from "@/store/useMediaStore";
import { Post } from "@/types/post";

interface PostCardContentProps {
  post: Post;
}

export const PostCardContent = ({ post }: PostCardContentProps) => {
  const isMobile = useMediaStore((state) => state.isMobile);
  return isMobile ? <MobileCardContent post={post} /> : <DesktopCardContent post={post} />;
};

const MobileCardContent = ({ post }: PostCardContentProps) => {
  return (
    <CardContent className="p-0">
      <div className="flex items-center ml-4 mb-3 gap-3">
        <PostAvatar
          blogPlatform={post.blogPlatform}
          className="h-8 w-8 ring-2 ring-background cursor-pointer"
          author={post.author}
        />
        <p className="font-bold text-sm">{post.author}</p>
      </div>
      <div className="px-4 pb-4">
        <p className="h-[48px] font-bold text-md group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </p>
        {post.tag && <PostTag tags={post.tag} />}

        <p className="text-[12px] text-gray-400 pt-2">{formatDate(post.createdAt)}</p>
      </div>
    </CardContent>
  );
};

const DesktopCardContent = ({ post }: PostCardContentProps) => {
  return (
    <CardContent className="p-0">
      <div className="relative -mt-4 ml-4 mb-3">
        <PostAvatar
          blogPlatform={post.blogPlatform}
          className="h-8 w-8 ring-2 ring-background cursor-pointer"
          author={post.author}
        />
      </div>
      <div className="px-4 pb-4">
        <p className="font-bold text-xs text-gray-400 pb-1 line-clamp-1">{post.author}</p>
        <p className="h-[40px] font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </p>
        <p className="text-[10px] text-gray-400 pt-2 pb-1">{formatDate(post.createdAt)}</p>
        {post.tag && <PostTag tags={post.tag} />}
      </div>
    </CardContent>
  );
};

export default PostCardContent;
