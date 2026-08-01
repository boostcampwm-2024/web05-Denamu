import { Navigate } from "react-router-dom";

import { Toaster } from "@/components/ui/toaster";

import { useAppInitialization } from "@/hooks/useAppInitialization";
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";

import { QueryProvider } from "@/providers/QueryProvider";
import { AppRouter } from "@/routes";

export default function App() {
  const { state, location, shouldRedirectToAbout, setVisited } = useAppInitialization();
  useGoogleAnalytics();
  if (shouldRedirectToAbout) {
    setVisited();
    return <Navigate to="/about" replace />;
  }

  return (
    <QueryProvider>
      <AppRouter location={location} state={state} />
      <Toaster />
    </QueryProvider>
  );
}
