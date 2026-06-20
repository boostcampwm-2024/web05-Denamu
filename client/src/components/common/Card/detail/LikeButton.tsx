import { Heart } from "lucide-react";

import { useLikeStatus, useToggleLike } from "@/hooks/queries/useLike";

import { useAuthStore } from "@/store/useAuthStore";
import { useMediaStore } from "@/store/useMediaStore";
import { Post } from "@/types/post";

export default function LikeButton({ post }: { post: Post }) {
  const isMobile = useMediaStore((state) => state.isMobile);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data: isLike = false } = useLikeStatus(post.id, isAuthenticated);
  const { mutate: toggleLike, isPending } = useToggleLike(post.id);

  const count = post.likes ?? 0;

  const handleClick = () => {
    if (!isAuthenticated) return;
    toggleLike(isLike);
  };

  return isMobile ? (
    <MobileButton isLike={isLike} count={count} disabled={isPending} onClick={handleClick} />
  ) : (
    <DesktopButton isLike={isLike} count={count} disabled={isPending} onClick={handleClick} />
  );
}

interface ButtonProps {
  isLike: boolean;
  count: number;
  disabled: boolean;
  onClick: () => void;
}

const DesktopButton = ({ isLike, count, disabled, onClick }: ButtonProps) => (
  <button
    className={`flex items-center px-4 py-2 rounded-full transition-colors disabled:opacity-60 ${
      isLike ? "bg-pink-500 text-white hover:bg-pink-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
    onClick={onClick}
    disabled={disabled}
  >
    <Heart className={`w-4 h-4 mr-2 ${isLike ? "fill-white" : ""}`} />
    좋아요 {count}
  </button>
);

const MobileButton = ({ isLike, count, disabled, onClick }: ButtonProps) => (
  <button
    className="flex flex-col items-center p-4 rounded-xl transition-colors disabled:opacity-60"
    onClick={onClick}
    disabled={disabled}
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-colors ${
        isLike ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-700"
      }`}
    >
      <Heart className={`w-6 h-6 ${isLike ? "fill-white" : ""}`} />
    </div>
    <span>좋아요 {count}</span>
  </button>
);
