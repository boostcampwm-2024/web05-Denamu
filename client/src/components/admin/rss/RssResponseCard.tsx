import { Card, CardContent } from "@/components/ui/card";

import { AdminRssData } from "@/types/rss";

interface RssResponseCardProps {
  request: AdminRssData;
}

export const RssResponseCard = ({ request }: RssResponseCardProps) => {
  return (
    <Card>
      <CardContent className="flex justify-between p-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{request.name}</h3>
          <p className="text-sm text-muted-foreground">{request.rssUrl}</p>
          {request.description && <p className="text-sm text-muted-foreground">거부 사유:{request.description}</p>}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">신청자: {request.userName}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
