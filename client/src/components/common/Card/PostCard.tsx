import { useNavigate, useLocation } from "react-router-dom";

import { Card, MCard } from "@/components/ui/card";

import { usePostCardActions } from "@/hooks/common/usePostCardActions";

import { PostCardContent } from "./PostCardContent";
import { PostCardImage } from "./PostCardImage";
import { cn } from "@/lib/utils";
import { useMediaStore } from "@/store/useMediaStore";
import { PostCardProps } from "@/types/card";

export const PostCard = ({ post, className }: PostCardProps) => {
  const isMobile = useMediaStore((state) => state.isMobile);

  return isMobile ? (
    <MobileCard post={post} className={className} />
  ) : (
    <DesktopCard post={post} className={className} />
  );
};

const DesktopCard = ({ post, className }: PostCardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { incrementView } = usePostCardActions(post);
  const openPostDetail = (modalUrl: string) => {
    incrementView({ post, isWindowOpened: true });
    navigate(modalUrl, { state: { backgroundLocation: location } });
  };
  return (
    <Card
      onClick={() => openPostDetail(`/${post.id}`)}
      className={cn(
        "h-[270px] group shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border-none rounded-xl cursor-pointer",
        className
      )}
    >
      <PostCardImage thumbnail={post.thumbnail} alt={post.title} />
      <PostCardContent post={post} />
    </Card>
  );
};
const MobileCard = ({ post, className }: PostCardProps) => {
  const navigate = useNavigate();

  return (
    <MCard
      onClick={() => {
        navigate(`/${post.id}`);
      }}
      className={cn("aspect-[5/3] transition-all duration-300 flex flex-col gap-2", className)}
    >
      <PostCardImage thumbnail={post.thumbnail} alt={post.title} />
      <PostCardContent post={post} />
    </MCard>
  );
};
