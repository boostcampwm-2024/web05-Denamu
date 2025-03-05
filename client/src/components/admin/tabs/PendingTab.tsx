import { RssRequestCard } from "@/components/admin/rss/RssRequestCard";
import { TabsContent } from "@/components/ui/tabs";

import { AdminRssData } from "@/types/rss";

interface PendingTabProps {
  data: AdminRssData[];
  onApprove: (request: AdminRssData) => void;
  onReject: (request: AdminRssData) => void;
}
export default function PendingTab({ data, onApprove, onReject }: PendingTabProps) {
  return (
    <TabsContent value="pending" className="space-y-4 mt-4">
      {data.map((request) => (
        <RssRequestCard
          key={request.id}
          request={request}
          onApprove={() => onApprove(request)}
          onReject={() => onReject(request)}
        />
      ))}
    </TabsContent>
  );
}
