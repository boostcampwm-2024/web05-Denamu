import { TabsContent } from "@/components/ui/tabs";

import { RssResponseCard } from "../rss/RssResponseCard";
import { AdminRssData } from "@/types/rss";

interface RejectedTabProps {
  data: AdminRssData[];
}

export default function RejectedTab({ data }: RejectedTabProps) {
  return (
    <TabsContent value="rejected" className="space-y-4 mt-4">
      {data.map((request) => (
        <RssResponseCard key={request.id} request={request} />
      ))}
    </TabsContent>
  );
}
