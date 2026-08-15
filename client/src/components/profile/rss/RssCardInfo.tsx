import { ReactNode } from "react";
import { Link } from "react-router-dom";

import { BlogPlatformBadge } from "@/components/profile/rss/BlogPlatformBadge.tsx";
import { PlatformIcon } from "@/components/profile/rss/PlatformIcon.tsx";

interface RssCardInfoProps {
  name: string;
  nameTo?: string;
  userName: string;
  blogUrl: string;
  blogPlatform: string;
  blogImage: string | null;
  action?: ReactNode;
  children?: ReactNode;
}

export const RssCardInfo = ({
  name,
  nameTo,
  userName,
  blogUrl,
  blogPlatform,
  blogImage,
  action,
  children,
}: RssCardInfoProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex items-center min-w-0 flex-1 gap-3">
        <PlatformIcon platform={blogPlatform} image={blogImage} name={name} className="flex-shrink-0 w-10 h-10" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {nameTo ? (
              <Link to={nameTo} className="font-medium truncate hover:underline">
                {name}
              </Link>
            ) : (
              <p className="font-medium truncate">{name}</p>
            )}
            <BlogPlatformBadge platform={blogPlatform} className="flex-shrink-0" />
          </div>
          <p className="text-sm text-gray-500 truncate">{userName}</p>
          <a
            href={blogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-gray-400 truncate hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {blogUrl}
          </a>
          {children}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0 self-end md:self-auto" onClick={(e) => e.stopPropagation()}>
          {action}
        </div>
      )}
    </div>
  );
};
