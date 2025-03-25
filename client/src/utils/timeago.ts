export function timeAgo(dateString: string) {
  const now = new Date();
  const past = new Date(dateString);
  const diff = Number(now) - Number(past);

  const diffMin = Math.floor(diff / (1000 * 60));
  const diffHour = Math.floor(diff / (1000 * 60 * 60));
  const diffDay = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${diffDay}일 전`;
}
