export const blogUrlToRss = (url: string): string => {
  let cleanUrl = url.trim();
  if (cleanUrl.endsWith("/")) {
    cleanUrl = cleanUrl.slice(0, -1);
  }

  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = `https://${cleanUrl}`;
  }

  try {
    const urlObj = new URL(cleanUrl);
    const hostname = urlObj.hostname;

    if (hostname.endsWith("tistory.com")) {
      return `${urlObj.protocol}//${hostname}/rss`;
    }

    if (hostname === "velog.io") {
      const path = urlObj.pathname;
      if (path.startsWith("/@")) {
        const username = path.slice(2);
        return `https://v2.velog.io/rss/@${username.split("/")[0]}`;
      }
      return cleanUrl;
    }

    if (hostname === "medium.com") {
      const path = urlObj.pathname;
      if (path.startsWith("/@")) {
        const username = path.slice(2).split("/")[0];
        return `https://medium.com/feed/@${username}`;
      }
      return cleanUrl;
    }

    if (hostname === "blog.naver.com") {
      const path = urlObj.pathname;
      const segments = path.slice(1).split("/");
      if (segments.length > 0) {
        const blogId = segments[0];
        return `https://rss.blog.naver.com/${blogId}`;
      }
      return cleanUrl;
    }

    if (cleanUrl.includes("/rss") || cleanUrl.includes("/feed")) {
      return cleanUrl;
    }

    return cleanUrl;
  } catch {
    return url;
  }
};
