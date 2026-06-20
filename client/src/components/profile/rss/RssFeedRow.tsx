import { Link } from "react-router-dom";

import { Eye, EyeOff, Heart, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";

interface RssFeedRowProps {
  id: number;
  title: string;
  createdAt: string;
  commentCount: number;
  likeCount: number;
  isPublic?: boolean;
  onToggleVisibility?: (next: boolean) => void;
  toggleDisabled?: boolean;
}

export const RssFeedRow = ({
  id,
  title,
  createdAt,
  commentCount,
  likeCount,
  isPublic = true,
  onToggleVisibility,
  toggleDisabled = false,
}: RssFeedRowProps) => {
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center min-w-0 gap-2">
        {isPublic ? (
          <Link to={`/${id}`} className="text-gray-800 truncate hover:underline">
            {title}
          </Link>
        ) : (
          <span className="text-gray-400 truncate">{title}</span>
        )}
        {!isPublic && (
          <Badge variant="secondary" className="flex-shrink-0">
            비공개
          </Badge>
        )}
      </div>
      <div className="flex items-center flex-shrink-0 gap-3 text-gray-400">
        <span>{new Date(createdAt).toLocaleDateString("ko-KR")}</span>
        <span className="flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5" />
          {commentCount}
        </span>
        <span className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5" />
          {likeCount}
        </span>
        {onToggleVisibility && (
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            onClick={() => onToggleVisibility(!isPublic)}
            disabled={toggleDisabled}
            aria-label={isPublic ? "비공개로 전환" : "공개로 전환"}
          >
            {isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-red-500" />}
          </Button>
        )}
      </div>
    </li>
  );
};
