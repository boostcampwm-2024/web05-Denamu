import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Location } from "react-router-dom";

import PostDetail from "@/components/common/Card/PostDetail";

import Loading from "@/pages/Loading";

const Home = lazy(() => import("@/pages/Home"));
const Admin = lazy(() => import("@/pages/Admin"));
const AboutService = lazy(() => import("@/pages/AboutService"));
const BoardListPage = lazy(() => import("@/pages/BoardListPage"));
const BoardDetailPage = lazy(() => import("@/pages/BoardDetailPage"));
const QnaDetailPage = lazy(() => import("@/pages/QnaDetailPage"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const PostDetailPage = lazy(() => import("@/pages/PostDetailPage"));
const Profile = lazy(() => import("@/pages/Profile"));
const RssPage = lazy(() => import("@/pages/RssPage"));
const RssListPage = lazy(() => import("@/pages/RssListPage"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const UserCertificate = lazy(() => import("@/pages/email-actions/UserCertificate"));
const AdminCertificate = lazy(() => import("@/pages/email-actions/AdminCertificate"));
const AdminWithdraw = lazy(() => import("@/pages/email-actions/AdminWithdraw"));
const AdminPasswordReset = lazy(() => import("@/pages/email-actions/AdminPasswordReset"));
const UserWithdraw = lazy(() => import("@/pages/email-actions/UserWithdraw"));
const RssCertificate = lazy(() => import("@/pages/email-actions/RssCertificate"));
const RssRemoval = lazy(() => import("@/pages/email-actions/RssRemoval"));
const OAuthSuccessPage = lazy(() => import("@/pages/OAuthSuccessPage"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const UserPasswordReset = lazy(() => import("@/pages/ResetPassword"));
const OAuthSignUpPage = lazy(() => import("@/pages/OAuthSignUpPage"));

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
          path="/board"
          element={
            <Suspense fallback={<Loading />}>
              <BoardListPage />
            </Suspense>
          }
        />
        <Route
          path="/board/:id"
          element={
            <Suspense fallback={<Loading />}>
              <BoardDetailPage />
            </Suspense>
          }
        />
        <Route path="/qna" element={<Navigate to="/board" replace />} />
        <Route
          path="/qna/:id"
          element={
            <Suspense fallback={<Loading />}>
              <QnaDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/privacy"
          element={
            <Suspense fallback={<Loading />}>
              <PrivacyPolicy />
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
          path="/oauth-success"
          element={
            <Suspense fallback={<Loading />}>
              <OAuthSuccessPage />
            </Suspense>
          }
        />
        <Route
          path="/oauth-signup"
          element={
            <Suspense fallback={<Loading />}>
              <OAuthSignUpPage />
            </Suspense>
          }
        />
        <Route
          path="/users/email-verifications"
          element={
            <Suspense fallback={<Loading />}>
              <UserCertificate />
            </Suspense>
          }
        />
        <Route
          path="/admins/email-verifications"
          element={
            <Suspense fallback={<Loading />}>
              <AdminCertificate />
            </Suspense>
          }
        />
        <Route
          path="/admins/deletion-requests/confirm"
          element={
            <Suspense fallback={<Loading />}>
              <AdminWithdraw />
            </Suspense>
          }
        />
        <Route
          path="/admins/password-resets/confirm"
          element={
            <Suspense fallback={<Loading />}>
              <AdminPasswordReset />
            </Suspense>
          }
        />
        <Route
          path="/users/deletion-requests/confirm"
          element={
            <Suspense fallback={<Loading />}>
              <UserWithdraw />
            </Suspense>
          }
        />
        <Route
          path="/rss/certifications/confirm"
          element={
            <Suspense fallback={<Loading />}>
              <RssCertificate />
            </Suspense>
          }
        />
        <Route
          path="/rss/removals/confirm"
          element={
            <Suspense fallback={<Loading />}>
              <RssRemoval />
            </Suspense>
          }
        />
        <Route
          path="/users/forgot-password"
          element={
            <Suspense fallback={<Loading />}>
              <ForgotPassword />
            </Suspense>
          }
        />
        <Route
          path="/users/password-resets/confirm"
          element={
            <Suspense fallback={<Loading />}>
              <UserPasswordReset />
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
          path="/profile/:id"
          element={
            <Suspense fallback={<Loading />}>
              <Profile />
            </Suspense>
          }
        />
        <Route
          path="/rss"
          element={
            <Suspense fallback={<Loading />}>
              <RssListPage />
            </Suspense>
          }
        />
        <Route
          path="/rss/:rssId"
          element={
            <Suspense fallback={<Loading />}>
              <RssPage />
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
