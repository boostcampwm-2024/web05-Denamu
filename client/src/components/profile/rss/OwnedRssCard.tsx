import { Pencil, Trash2 } from "lucide-react";

import { PlatformIcon } from "@/components/profile/rss/PlatformIcon.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";

import { CertifiedRss } from "@/types/profile.ts";

interface OwnedRssCardProps {
  rss: CertifiedRss;
  onEdit: (rss: CertifiedRss) => void;
  onDelete: (rss: CertifiedRss) => void;
}

export const OwnedRssCard = ({ rss, onEdit, onDelete }: OwnedRssCardProps) => {
  return (
    <li className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
      <div className="flex items-center min-w-0 space-x-3">
        <PlatformIcon platform={rss.blogPlatform} className="flex-shrink-0 w-10 h-10" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{rss.name}</p>
            <Badge variant="secondary" className="flex-shrink-0">
              {rss.blogPlatform}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 truncate">{rss.userName}</p>
          <a
            href={rss.rssUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 truncate hover:underline"
          >
            {rss.rssUrl}
          </a>
        </div>
      </div>
      <div className="flex flex-shrink-0 gap-1 ml-3">
        <Button variant="ghost" size="icon" onClick={() => onEdit(rss)} aria-label="RSS 정보 수정">
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(rss)}
          aria-label="RSS 소유 해제"
          className="text-red-500 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </li>
  );
};
