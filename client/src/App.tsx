import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import PostDetail from "@/components/common/Card/PostDetail";
import { Toaster } from "@/components/ui/toaster";

import Loading from "@/pages/Loading";
import PostDetailPage from "@/pages/PostDetailPage";
import Profile from "@/pages/Profile";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";

import { useMediaQuery } from "@/hooks/common/useMediaQuery";

import { denamuAscii } from "@/constants/denamuAscii";

import { useMediaStore } from "@/store/useMediaStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const Home = lazy(() => import("@/pages/Home"));
const Admin = lazy(() => import("@/pages/Admin"));
const AboutService = lazy(() => import("@/pages/AboutService"));

const queryClient = new QueryClient();

export default function App() {
  const setIsMobile = useMediaStore((state) => state.setIsMobile);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const location = useLocation();
  const state =
    location.state && location.state.backgroundLocation
      ? { backgroundLocation: location.state.backgroundLocation }
      : null;

  useEffect(() => {
    console.log(denamuAscii);
  }, []);

  useEffect(() => {
    if (location.state?.backgroundLocation) {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
  }, [location]);

  useEffect(() => {
    setIsMobile(isMobile);
  }, [isMobile]);

  return (
    <QueryClientProvider client={queryClient}>
      <Routes location={state?.backgroundLocation || location}>
        <Route
          path="/"
          element={
            <Suspense fallback={<Loading />}>
              <Home />
            </Suspense>
          }
        />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<Loading />}>
              <Admin />
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<Loading />}>
              <AboutService />
            </Suspense>
          }
        />
        <Route
          path="/signin"
          element={
            <Suspense fallback={<Loading />}>
              <SignIn />
            </Suspense>
          }
        />
        <Route
          path="/signup"
          element={
            <Suspense fallback={<Loading />}>
              <SignUp />
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <Suspense fallback={<Loading />}>
              <Profile />
            </Suspense>
          }
        />
        <Route
          path="/:id"
          element={
            <Suspense fallback={<Loading />}>
              <PostDetailPage />
            </Suspense>
          }
        />
      </Routes>
      {state?.backgroundLocation && (
        <Routes>
          <Route path="/:id" element={<PostDetail />} />
        </Routes>
      )}
      <Toaster />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
