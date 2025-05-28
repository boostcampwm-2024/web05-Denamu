import { lazy, Suspense } from "react";
import { Routes, Route, Location } from "react-router-dom";

import PostDetail from "@/components/common/Card/PostDetail";

import Loading from "@/pages/Loading";

const Home = lazy(() => import("@/pages/Home"));
const Admin = lazy(() => import("@/pages/Admin"));
const AboutService = lazy(() => import("@/pages/AboutService"));
const PostDetailPage = lazy(() => import("@/pages/PostDetailPage"));
const Profile = lazy(() => import("@/pages/Profile"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const UserCertificate = lazy(() => import("@/pages/UserCertificate"));

interface RouterProps {
  location: Location;
  state: { backgroundLocation: Location } | null;
}

export const AppRouter = ({ location, state }: RouterProps) => {
  return (
    <>
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
          path="/user/certificate"
          element={
            <Suspense fallback={<Loading />}>
              <UserCertificate />
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
    </>
  );
};
