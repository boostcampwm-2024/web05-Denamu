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

type BlogPlatform = "Tistory" | "Velog" | "Medium" | "Naver Blog" | "기타";

const detectBlogPlatform = (url: string): BlogPlatform | null => {
  if (!url.trim()) return null;

  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    const hostname = urlObj.hostname;

    if (hostname.endsWith("tistory.com")) return "Tistory";
    if (hostname === "velog.io") return "Velog";
    if (hostname === "medium.com") return "Medium";
    if (hostname.endsWith("blog.naver.com")) return "Naver Blog";
    return "기타";
  } catch {
    return null;
  }
};

export const useRssRegistrationForm = () => {
  const [platform, setPlatform] = useState<PlatformType>("tistory");
  const [blogUrl, setBlogUrl] = useState<string>("");
  const [blogPlatform, setBlogPlatform] = useState<BlogPlatform | null>(null);
  const store = useRegisterModalStore();

  const handlePlatformChange = (newPlatform: string) => {
    setPlatform(newPlatform as PlatformType);
    setBlogUrl("");
    store.handleInputChange("", store.setRssUrl, store.setRssUrlValid, validateRssUrl);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value;
    const { prefix, suffix } = PLATFORMS[platform];
    const fullUrl = `${prefix}${username}${suffix}`;
    store.handleInputChange(fullUrl, store.setRssUrl, store.setRssUrlValid, validateRssUrl);
  };

  const handleBlogUrlChange = (value: string) => {
    setBlogUrl(value);
    setBlogPlatform(detectBlogPlatform(value));

    if (value.trim()) {
      const rssUrl = blogUrlToRss(value);
      store.handleInputChange(rssUrl, store.setRssUrl, store.setRssUrlValid, validateRssUrl);
    } else {
      store.handleInputChange("", store.setRssUrl, store.setRssUrlValid, validateRssUrl);
    }
  };

  const getUsernameFromUrl = () => {
    const { prefix, suffix } = PLATFORMS[platform];
    return store.rssUrl.replace(prefix, "").replace(suffix, "");
  };

  return {
    platform,
    values: {
      rssUrl: store.rssUrl,
      bloggerName: store.bloggerName,
      userName: store.userName,
      email: store.email,
      urlUsername: getUsernameFromUrl(),
      blogUrl: blogUrl,
    },
    handlers: {
      handlePlatformChange,
      handleUsernameChange,
      handleBlogUrlChange,
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
