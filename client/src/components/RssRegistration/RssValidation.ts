export const validateRssUrl = (url: string) => {
  const platformPatterns = {
    tistory: /^https?:\/\/[a-zA-Z0-9-]+\.tistory\.com\/(rss|feed)$/,
    velog: /^https?:\/\/(velog\.io\/@[a-zA-Z0-9-_]+\/(rss|feed)|(?:v2\.|api\.)?velog\.io\/rss\/@[a-zA-Z0-9-_]+)$/,
    medium: /^https?:\/\/medium\.com\/@[a-zA-Z0-9-_]+\/feed$/,
    naver: /^https?:\/\/rss\.blog\.naver\.com\/[a-zA-Z0-9-_]+$/,
  };
  return Object.values(platformPatterns).some((pattern) => pattern.test(url));
};

export const validateName = (name: string) => {
  return name.trim().length > 0;
};

export const validateBlogger = (bloggerName: string) => {
  return bloggerName.trim().length > 0;
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
