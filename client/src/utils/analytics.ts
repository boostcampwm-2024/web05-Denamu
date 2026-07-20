import ReactGA from "react-ga4";

const GA_ID = import.meta.env.VITE_GA_ID;

export const isGAEnabled = Boolean(GA_ID) && import.meta.env.PROD;

export const initGA = () => {
  if (!isGAEnabled) return;
  ReactGA.initialize(GA_ID);
};

export const trackPageView = (path: string) => {
  if (!isGAEnabled) return;
  ReactGA.send({ hitType: "pageview", page: path, title: document.title });
};

export const trackEvent = (action: string, params?: Record<string, string | number | boolean>) => {
  if (!isGAEnabled) return;
  ReactGA.event(action, params);
};
