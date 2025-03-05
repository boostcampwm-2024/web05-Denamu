import { TabsContent } from "@/components/ui/tabs";

import { RssResponseCard } from "../rss/RssResponseCard";
import { AdminRssData } from "@/types/rss";

interface AcceptedTabProps {
  data: AdminRssData[];
}

export default function AcceptedTab({ data }: AcceptedTabProps) {
  return (
    <TabsContent value="accepted" className="space-y-4 mt-4">
      {data.map((request) => (
        <RssResponseCard key={request.id} request={request} />
      ))}
    </TabsContent>
  );
}
