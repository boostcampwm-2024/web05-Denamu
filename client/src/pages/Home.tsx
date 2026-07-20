import ChartTab from "@/components/chart/ChartTab.tsx";
import Layout from "@/components/layout/Layout";
import ScrollAwareFooter from "@/components/layout/ScrollAwareFooter";
import MainContent from "@/components/sections/MainContent";

import { useTapStore } from "@/store/useTapStore";

export default function Home() {
  const { tap } = useTapStore();

  const renderFunction = () => {
    if (tap === "main") return <MainContent />;
    return <ChartTab />;
  };

  return (
    <>
      <Layout>{renderFunction()}</Layout>
      <ScrollAwareFooter />
    </>
  );
}
