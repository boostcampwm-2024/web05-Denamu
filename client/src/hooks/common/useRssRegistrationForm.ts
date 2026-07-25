import { useState } from "react";

import {
  validateRssUrl,
  validateName,
  validateEmail,
  validateBlogger,
} from "@/components/RssRegistration/RssValidation";

import { BLOG_ADDRESS_TEMPLATES, BlogAddressPlatformType } from "@/constants/rss";

import { blogUrlToRss } from "@/utils/blogUrlToRss";

import { useRegisterModalStore } from "@/store/useRegisterModalStore";

export const PLATFORM_OPTIONS = [
  { value: "tistory", label: "Tistory" },
  { value: "velog", label: "Velog" },
  { value: "medium", label: "Medium" },
  { value: "github", label: "GitHub" },
  { value: "naver", label: "Naver" },
  { value: "other", label: "기타" },
];

const isTemplatedPlatform = (value: string): value is BlogAddressPlatformType =>
  value in BLOG_ADDRESS_TEMPLATES;

const buildBlogUrl = (platformValue: string, addressInput: string): string => {
  if (!isTemplatedPlatform(platformValue)) return "";
  if (!addressInput.trim()) return "";

  const { prefix, suffix } = BLOG_ADDRESS_TEMPLATES[platformValue];
  return `${prefix}${addressInput}${suffix}`;
};

export const useRssRegistrationForm = () => {
  const [selectedPlatformValue, setSelectedPlatformValue] = useState<string>("");
  const [addressInput, setAddressInput] = useState<string>("");
  const store = useRegisterModalStore();

  const handlePlatformSelection = (newPlatformValue: string) => {
    setSelectedPlatformValue(newPlatformValue);
    setAddressInput("");
    store.handleInputChange("", store.setRssUrl, store.setRssUrlValid, validateRssUrl);
  };

  const handleAddressInputChange = (value: string) => {
    setAddressInput(value);
    const blogUrl = buildBlogUrl(selectedPlatformValue, value);
    const rssUrl = blogUrl ? blogUrlToRss(blogUrl) : "";
    store.handleInputChange(rssUrl, store.setRssUrl, store.setRssUrlValid, validateRssUrl);
  };

  const handleRssDirectInput = (value: string) => {
    store.handleInputChange(value, store.setRssUrl, store.setRssUrlValid, validateRssUrl);
  };

  const reset = () => {
    store.resetInputs();
    setSelectedPlatformValue("");
    setAddressInput("");
  };

  return {
    selectedPlatformValue,
    addressTemplate: isTemplatedPlatform(selectedPlatformValue)
      ? BLOG_ADDRESS_TEMPLATES[selectedPlatformValue]
      : null,
    values: {
      rssUrl: store.rssUrl,
      bloggerName: store.bloggerName,
      userName: store.userName,
      email: store.email,
      addressInput,
      platformValue: selectedPlatformValue,
    },
    handlers: {
      handlePlatformSelection,
      handleAddressInputChange,
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
      reset,
    },
  };
};
