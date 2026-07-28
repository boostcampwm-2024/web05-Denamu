import { useState, useEffect } from "react";

import { Loader } from "lucide-react";

import AdminChatTab from "@/components/admin/chat/AdminChatTab";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import AdminMember from "@/components/admin/layout/AdminMember";
import AdminMyPage from "@/components/admin/layout/AdminMyPage";
import { AdminTabs } from "@/components/admin/layout/AdminTabs";
import AdminLogin from "@/components/admin/login/AdminLoginModal";
import AdminNoticeTab from "@/components/admin/notice/AdminNoticeTab";
import AdminPostTab from "@/components/admin/post/AdminPostTab";
import AdminReportTab from "@/components/admin/report/AdminReportTab";
import { RssRequestSearchBar } from "@/components/admin/rss/RssSearchBar";

import { useAdminCheck } from "@/hooks/queries/useAdminAuth";

export default function Admin() {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const { status, isLoading, data } = useAdminCheck();
  const [tap, setTap] = useState<"RSS" | "MEMBER" | "MYPAGE" | "POST" | "CHAT" | "REPORT" | "NOTICE">("RSS");

  useEffect(() => {
    setIsLogin(status === "success");
  }, [status]);

  const renderContent = () => {
    if (tap === "RSS") {
      return (
        <>
          <RssRequestSearchBar />
          <AdminTabs setLogout={() => setIsLogin(false)} />
        </>
      );
    }
    if (tap === "MYPAGE") {
      return <AdminMyPage onBack={() => setTap("RSS")} />;
    }
    if (tap === "POST") {
      return <AdminPostTab />;
    }
    if (tap === "CHAT") {
      return <AdminChatTab />;
    }
    if (tap === "REPORT") {
      return <AdminReportTab />;
    }
    if (tap === "NOTICE") {
      return <AdminNoticeTab />;
    }
    return <AdminMember />;
  };

  if (isLoading && !isLogin)
    return (
      <main className="w-full h-[100vh] flex justify-center items-center">
        <Loader size={50} />{" "}
      </main>
    );

  return isLogin ? (
    <main className="min-h-screen bg-background">
      <AdminHeader setLogin={() => setIsLogin(false)} handleTap={setTap} name={data?.name} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">{renderContent()} </div>
    </main>
  ) : (
    <AdminLogin setLogin={() => setIsLogin(true)} />
  );
}
