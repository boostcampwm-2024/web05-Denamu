export const useUpdateRecentTags = (newTags: string[]) => {
  const recentTag = localStorage.getItem("recent-tag");
  let tags: string[] = recentTag ? JSON.parse(recentTag) : [];

  for (const tag of newTags) {
    if (tag === "Next.JS") continue;
    tags = [tag, ...tags.filter((t) => t !== tag)];
    if (tags.length > 3) tags.pop();
  }

  localStorage.setItem("recent-tag", JSON.stringify(tags));
};
