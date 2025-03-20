export const validateRssUrl = (url: string) => {
  if (!url.trim()) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
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
