import { CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { AdminRssData } from "@/types/rss";

interface RssRequestCardProps {
  request: AdminRssData;
  onApprove: (request: AdminRssData) => void;
  onReject: (request: AdminRssData) => void;
}

export const RssRequestCard = ({ request, onApprove, onReject }: RssRequestCardProps) => {
  return (
    <Card>
      <CardContent className="flex justify-between p-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{request.name}</h3>
          <p className="text-sm text-muted-foreground">{request.rssUrl}</p>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">신청자: {request.userName}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => onApprove(request)}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            승인
          </Button>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onReject(request)}
          >
            <XCircle className="mr-2 h-4 w-4" />
            거부
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
