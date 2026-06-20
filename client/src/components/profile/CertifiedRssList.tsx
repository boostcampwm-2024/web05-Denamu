import { CertifiedRssCard } from "@/components/profile/rss/CertifiedRssCard.tsx";
import { Card, CardContent } from "@/components/ui/card.tsx";

import { CertifiedRss } from "@/types/profile.ts";

interface CertifiedRssListProps {
  userId: number;
  rssList: CertifiedRss[];
}

export const CertifiedRssList = ({ userId, rssList }: CertifiedRssListProps) => {
  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h3 className="mb-4 text-lg font-semibold">인증된 RSS</h3>
        {rssList.length === 0 ? (
          <p className="text-sm text-gray-400">인증된 RSS가 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {rssList.map((rss) => (
              <CertifiedRssCard key={rss.id} userId={userId} rss={rss} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
