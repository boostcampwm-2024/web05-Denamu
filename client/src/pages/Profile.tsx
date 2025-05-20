import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useCustomToast } from "@/hooks/common/useCustomToast.ts";

import { TOAST_MESSAGES } from "@/constants/messages";

export default function ProfileLayout() {
  const { toast } = useCustomToast();
  const navigate = useNavigate();

  useEffect(() => {
    toast(TOAST_MESSAGES.SERVICE_NOT_PREPARED);
    navigate("/");
  }, [toast, navigate]);

  return null;
  // return (
  //   <div className="flex min-h-screen bg-gray-50">
  //     <Sidebar />

  //     <div className="flex-1 ml-64">
  //       <div className="max-w-4xl mx-auto p-8">
  //         <Header user={mockUser} />
  //         <RecentPosts user={mockUser} />
  //         <LikedPosts />
  //         <Settings />
  //       </div>
  //     </div>
  //   </div>
  // );
}
