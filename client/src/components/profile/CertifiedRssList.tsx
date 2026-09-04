import { CertifiedRssCard } from "@/components/profile/rss/CertifiedRssCard.tsx";

import { CertifiedRss } from "@/types/profile.ts";

interface CertifiedRssListProps {
  userId: number;
  rssList: CertifiedRss[];
  isOwner: boolean;
}

export const CertifiedRssList = ({ userId, rssList, isOwner }: CertifiedRssListProps) => {
  return (
    <div className="py-8 border-b border-gray-200">
      <p className="mb-4 text-xs font-semibold tracking-wider text-[#FF870D] uppercase">인증된 RSS</p>
      {rssList.length === 0 ? (
        <p className="text-sm text-gray-400">인증된 RSS가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {rssList.map((rss) => (
            <CertifiedRssCard key={rss.id} userId={userId} rss={rss} isOwner={isOwner} />
          ))}
        </ul>
      )}
    </div>
  );
};
