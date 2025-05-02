import { CATEGORIES } from "@/constants/filter";

export const useUpdateRecentTags = (newTags: string[]) => {
  const recentTag = localStorage.getItem("recent-tag");
  let tags: string[] = recentTag ? JSON.parse(recentTag) : [];

  for (const tag of newTags) {
    const isValid = CATEGORIES.some((category) => category.includes(tag));
    if (!isValid) continue;

    tags = [tag, ...tags.filter((t) => t !== tag)];
    if (tags.length > 3) tags.pop();
  }

  localStorage.setItem("recent-tag", JSON.stringify(tags));
};
