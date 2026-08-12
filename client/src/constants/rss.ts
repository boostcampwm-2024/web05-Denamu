export const PLATFORM_TYPES = ["tistory", "velog", "medium", "personal_blog"] as const;
export type PlatformType = (typeof PLATFORM_TYPES)[number];

interface Platform {
  name: string;
  prefix: string;
  suffix: string;
  placeholder: string;
}

export const PLATFORM_BADGE_COLORS: Record<string, string> = {
  tistory: "#EB531F",
  velog: "#20C997",
  github: "#7F00AF",
  naver: "#2DB400",
  medium: "#000000",
};

export const DEFAULT_BADGE_COLOR = "#6B7280";

export const PLATFORMS: Record<PlatformType, Platform> = {
  tistory: {
    name: "Tistory",
    prefix: "https://",
    suffix: ".tistory.com/rss",
    placeholder: "서브도메인",
  },
  velog: {
    name: "Velog",
    prefix: "https://v2.velog.io/rss/@",
    suffix: "",
    placeholder: "사용자명",
  },
  medium: {
    name: "Medium",
    prefix: "https://medium.com/feed/@",
    suffix: "",
    placeholder: "사용자명",
  },
  personal_blog: {
    name: "개인 블로그",
    prefix: "https://",
    suffix: "",
    placeholder: "블로그 주소",
  },
};

export const RSS_LIST_PLATFORM_FILTERS: { value: string; label: string }[] = [
  { value: "tistory", label: "Tistory" },
  { value: "velog", label: "Velog" },
  { value: "medium", label: "Medium" },
  { value: "github", label: "Github" },
  { value: "naver", label: "Naver" },
  { value: "etc", label: "기타" },
];

export const BLOG_ADDRESS_PLATFORM_TYPES = ["tistory", "velog", "medium", "github", "naver"] as const;
export type BlogAddressPlatformType = (typeof BLOG_ADDRESS_PLATFORM_TYPES)[number];

interface BlogAddressTemplate {
  prefix: string;
  suffix: string;
  placeholder: string;
}

export const BLOG_ADDRESS_TEMPLATES: Record<BlogAddressPlatformType, BlogAddressTemplate> = {
  tistory: { prefix: "https://", suffix: ".tistory.com", placeholder: "서브도메인" },
  velog: { prefix: "https://velog.io/@", suffix: "", placeholder: "사용자명" },
  medium: { prefix: "https://medium.com/@", suffix: "", placeholder: "사용자명" },
  github: { prefix: "https://", suffix: ".github.io", placeholder: "사용자명" },
  naver: { prefix: "https://blog.naver.com/", suffix: "", placeholder: "사용자명" },
};
