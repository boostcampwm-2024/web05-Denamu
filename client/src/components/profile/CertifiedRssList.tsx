import { Rss } from "lucide-react";

import { Badge } from "@/components/ui/badge.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";

import { CertifiedRss } from "@/types/profile.ts";

interface CertifiedRssListProps {
  rssList: CertifiedRss[];
}

export const CertifiedRssList = ({ rssList }: CertifiedRssListProps) => {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-semibold">인증된 RSS</h3>
        {rssList.length === 0 ? (
          <p className="text-sm text-gray-400">인증된 RSS가 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {rssList.map((rss) => (
              <li key={rss.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center min-w-0 space-x-3">
                  <Rss className="flex-shrink-0 w-5 h-5 text-blue-500" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{rss.name}</p>
                    <a
                      href={rss.rssUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 truncate hover:underline"
                    >
                      {rss.rssUrl}
                    </a>
                  </div>
                </div>
                <Badge variant="secondary" className="flex-shrink-0 ml-3">
                  {rss.blogPlatform}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
