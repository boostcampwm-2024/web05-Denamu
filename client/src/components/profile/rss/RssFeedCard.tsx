import { Link } from "react-router-dom";

import { Heart, MessageSquare } from "lucide-react";

import { formatDate } from "@/utils/date.ts";

interface RssFeedCardProps {
  id: number;
  title: string;
  thumbnail: string;
  createdAt: string;
  commentCount: number;
  likeCount: number;
}

export const RssFeedCard = ({ id, title, thumbnail, createdAt, commentCount, likeCount }: RssFeedCardProps) => {
  return (
    <li>
      <Link
        to={`/${id}`}
        className="flex items-center gap-4 p-3 transition-colors border border-gray-100 rounded-lg hover:bg-gray-50"
      >
        <img
          src={thumbnail}
          alt={title}
          loading="lazy"
          className="flex-shrink-0 object-cover w-24 h-16 bg-gray-100 rounded-md"
        />
        <div className="flex flex-col min-w-0 gap-1">
          <p className="font-medium text-gray-800 line-clamp-2">{title}</p>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>{formatDate(createdAt)}</span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              {likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {commentCount}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
};
