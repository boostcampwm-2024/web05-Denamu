import { useState } from "react";

import { AxiosError } from "axios";
import { TriangleAlert } from "lucide-react";

import { RejectModal } from "@/components/admin/rss/RejectModal";
import AcceptedTab from "@/components/admin/tabs/AcceptedTab";
import PendingTab from "@/components/admin/tabs/PendingTab";
import RejectedTab from "@/components/admin/tabs/RejectedTab";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useFetchRss, useFetchAccept, useFetchReject } from "@/hooks/queries/useFetchRss";
import { useAdminAccept, useAdminReject } from "@/hooks/queries/useRssActions";

import { useAdminSearchStore } from "@/store/useSearchStore";
import { AdminRssData, AdminRequest } from "@/types/rss";

type SelectedBlogType = {
  blogName: string;
  blogId: number;
};

export const AdminTabs = ({ setLogout }: { setLogout: () => void }) => {
  const [selectedBlog, setSelectedBlog] = useState<SelectedBlogType>({ blogId: 0, blogName: "" });
  const [reason, setReason] = useState("");
  const { searchParam } = useAdminSearchStore();
  const {
    data: pendingData,
    isLoading: isPendingLoading,
    error: pendingError,
    refetchData: refetchRss,
  } = useFetchRss();

  const {
    data: acceptedData,
    isLoading: isAcceptedLoading,
    error: acceptedError,
    refetchData: refetchAccept,
  } = useFetchAccept();

  const {
    data: rejectedData,
    isLoading: isRejectedLoading,
    error: rejectedError,
    refetchData: refetchReject,
  } = useFetchReject();

  const onSuccess = () => {
    setReason("");
    refetchRss();
    refetchAccept();
    refetchReject();
  };

  const onError = (error: unknown) => {
    if (error instanceof AxiosError) {
      console.error("Axios Error:", error.message, error.response?.data);
    } else if (error instanceof Error) {
      console.error("General Error:", error.message);
    } else {
      console.error("Unknown Error:", error);
    }
    setReason("");
    refetchRss();
    refetchAccept();
    refetchReject();
  };

  const { mutate: acceptMutate } = useAdminAccept(onSuccess, onError);
  const { mutate: rejectMutate } = useAdminReject(onSuccess, onError);

  const handleActions = (data: AdminRequest, actions: "accept" | "reject") => {
    if (actions === "accept") {
      acceptMutate(data);
    } else {
      rejectMutate(data);
    }
  };

  const handleSelectedBlog = ({ blogName, blogId }: SelectedBlogType) => {
    setSelectedBlog({ blogName, blogId });
  };

  if (isPendingLoading || isAcceptedLoading || isRejectedLoading) return <div>Loading...</div>;
  if (pendingError || acceptedError || rejectedError)
    return (
      <div className="w-full h-full fixed top-0 left-0 bg-black bg-opacity-80">
        <Alert className="w-[25vw] h-[20vh] fixed top-[50%] left-[50%] transform -translate-y-1/2 -translate-x-1/2 flex flex-col justify-between">
          <div className="flex gap-4 items-center pt-5">
            <TriangleAlert />
            <div className="flex flex-col gap-3">
              <AlertTitle className="flex items-center gap-3">세션이 만료되었습니다!</AlertTitle>
              <AlertDescription>서비스를 계속 사용하려면 로그인하세요.</AlertDescription>
            </div>
          </div>
          <Button className="" onClick={setLogout}>
            확인
          </Button>
        </Alert>
      </div>
    );

  const pendingRss: AdminRssData[] =
    searchParam === ""
      ? pendingData.data
      : pendingData.data.filter(
          (data: AdminRssData) =>
            data.name.includes(searchParam) || data.userName.includes(searchParam) || data.rssUrl.includes(searchParam)
        );
  const acceptedRss: AdminRssData[] =
    searchParam === ""
      ? acceptedData.data
      : acceptedData.data.filter(
          (data: AdminRssData) =>
            data.name.includes(searchParam) || data.userName.includes(searchParam) || data.rssUrl.includes(searchParam)
        );
  const rejectedRss: AdminRssData[] =
    searchParam === ""
      ? rejectedData.data
      : rejectedData.data.filter(
          (data: AdminRssData) =>
            data.name.includes(searchParam) || data.userName.includes(searchParam) || data.rssUrl.includes(searchParam)
        );

  return (
    <div>
      <Tabs defaultValue="pending" className="mb-8">
        <TabsList className="flex w-full lg:w-auto items-center">
          <TabsTrigger value="pending" className="relative w-full">
            대기 중
            <Badge variant="secondary" className="ml-2">
              {pendingRss.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="accepted" className="w-full">
            승인됨
          </TabsTrigger>
          <TabsTrigger value="rejected" className="w-full">
            거부됨
          </TabsTrigger>
        </TabsList>

        <PendingTab
          data={pendingRss}
          onApprove={(request) => handleActions(request, "accept")}
          onReject={(request) => handleSelectedBlog({ blogName: request.name, blogId: request.id })}
        />
        <AcceptedTab data={acceptedRss} />
        <RejectedTab data={rejectedRss} />
      </Tabs>
      <RejectModal
        blogName={selectedBlog?.blogName}
        onSubmit={() => handleActions({ id: selectedBlog.blogId, rejectMessage: reason }, "reject")}
        onCancel={() => setSelectedBlog({ blogId: 0, blogName: "" })}
        rejectMessage={reason}
        handleReason={setReason}
      />
    </div>
  );
};
