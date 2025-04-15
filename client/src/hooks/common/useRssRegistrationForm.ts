import { useState } from "react";

import {
  validateRssUrl,
  validateName,
  validateEmail,
  validateBlogger,
} from "@/components/RssRegistration/RssValidation";

import { PLATFORMS, PlatformType } from "@/constants/rss";

import { blogUrlToRss } from "@/utils/blogUrlToRss";

import { useRegisterModalStore } from "@/store/useRegisterModalStore";

type BlogPlatform = "Tistory" | "Velog" | "Medium" | "네이버 블로그" | "기타";

export const PLATFORM_OPTIONS = [
  { value: "tistory", label: "Tistory" },
  { value: "velog", label: "Velog" },
  { value: "medium", label: "Medium" },
  { value: "naver_blog", label: "네이버 블로그" },
  { value: "other", label: "기타" },
];

const mapPlatformToValue = (platform: BlogPlatform | null): string => {
  if (!platform) return "other";

  switch (platform) {
    case "Tistory":
      return "tistory";
    case "Velog":
      return "velog";
    case "Medium":
      return "medium";
    case "네이버 블로그":
      return "naver_blog";
    default:
      return "other";
  }
};

const detectBlogPlatform = (url: string): BlogPlatform | null => {
  if (!url.trim()) return null;

  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    const hostname = urlObj.hostname;

    if (hostname.endsWith("tistory.com")) return "Tistory";
    if (hostname === "velog.io") return "Velog";
    if (hostname === "medium.com") return "Medium";
    if (hostname.endsWith("blog.naver.com")) return "네이버 블로그";
    return "기타";
  } catch {
    return null;
  }
};

export const useRssRegistrationForm = () => {
  const [platform, setPlatform] = useState<PlatformType>("tistory");
  const [blogUrl, setBlogUrl] = useState<string>("");
  const [blogPlatform, setBlogPlatform] = useState<BlogPlatform | null>(null);
  const [selectedPlatformValue, setSelectedPlatformValue] = useState<string>("");
  const store = useRegisterModalStore();

  const handlePlatformChange = (newPlatform: string) => {
    setPlatform(newPlatform as PlatformType);
    setBlogUrl("");
    store.handleInputChange("", store.setRssUrl, store.setRssUrlValid, validateRssUrl);
  };

  const handlePlatformSelection = (newPlatformValue: string) => {
    setSelectedPlatformValue(newPlatformValue);
  };

  const handleBadgeClick = () => {
    if (blogPlatform) {
      const platformValue = mapPlatformToValue(blogPlatform);
      setSelectedPlatformValue(platformValue);

      if (blogUrl) {
        const rssUrl = blogUrlToRss(blogUrl);
        store.handleInputChange(rssUrl, store.setRssUrl, store.setRssUrlValid, validateRssUrl);
      }
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value;
    const { prefix, suffix } = PLATFORMS[platform];
    const fullUrl = `${prefix}${username}${suffix}`;
    store.handleInputChange(fullUrl, store.setRssUrl, store.setRssUrlValid, validateRssUrl);
  };

  const handleBlogUrlChange = (value: string) => {
    setBlogUrl(value);
    const detectedPlatform = detectBlogPlatform(value);
    setBlogPlatform(detectedPlatform);

    if (value.trim()) {
      const rssUrl = blogUrlToRss(value);
      store.handleInputChange(rssUrl, store.setRssUrl, store.setRssUrlValid, validateRssUrl);
    } else {
      store.handleInputChange("", store.setRssUrl, store.setRssUrlValid, validateRssUrl);
    }
  };

  const handleRssDirectInput = (value: string) => {
    store.handleInputChange(value, store.setRssUrl, store.setRssUrlValid, validateRssUrl);
  };

  const getUsernameFromUrl = () => {
    const { prefix, suffix } = PLATFORMS[platform];
    return store.rssUrl.replace(prefix, "").replace(suffix, "");
  };

  return {
    platform,
    selectedPlatformValue,
    values: {
      rssUrl: store.rssUrl,
      bloggerName: store.bloggerName,
      userName: store.userName,
      email: store.email,
      urlUsername: getUsernameFromUrl(),
      blogUrl: blogUrl,
      platformValue: selectedPlatformValue,
    },
    handlers: {
      handlePlatformChange,
      handleUsernameChange,
      handleBlogUrlChange,
      handlePlatformSelection,
      handleBadgeClick,
      handleRssDirectInput,
      handleBloggerName: (value: string) =>
        store.handleInputChange(value, store.setBloggerName, store.setBloggerNameValid, validateBlogger),
      handleUserName: (value: string) =>
        store.handleInputChange(value, store.setUserName, store.setUserNameValid, validateName),
      handleEmail: (value: string) =>
        store.handleInputChange(value, store.setEmail, store.setEmailValid, validateEmail),
    },
    formState: {
      isValid: store.isFormValid(),
      reset: store.resetInputs,
    },
    blogPlatform,
  };
};
