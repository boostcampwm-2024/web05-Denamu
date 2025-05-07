import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useMediaQuery } from "@/hooks/common/useMediaQuery";

import { denamuAscii } from "@/constants/denamuAscii";

import { useAuthStore } from "@/store/useAuthStore";
import { useMediaStore } from "@/store/useMediaStore";
import { useVisitStore } from "@/store/useVisitStore";

export const useAppInitialization = () => {
  const location = useLocation();
  const setIsMobile = useMediaStore((state) => state.setIsMobile);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { hasVisited, setVisited } = useVisitStore();
  const initialize = useAuthStore((state) => state.initialize);

  const state =
    location.state && location.state.backgroundLocation
      ? { backgroundLocation: location.state.backgroundLocation }
      : null;

  useEffect(() => {
    console.log(denamuAscii);
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (location.state?.backgroundLocation) {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
  }, [location]);

  useEffect(() => {
    setIsMobile(isMobile);
  }, [isMobile, setIsMobile]);

  const shouldRedirectToAbout = !hasVisited;

  return {
    state,
    location,
    shouldRedirectToAbout,
    setVisited,
  };
};
