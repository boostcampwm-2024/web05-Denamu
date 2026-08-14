let offsetMs = 0;

export function updateServerOffset(serverDateHeader: string | undefined) {
  if (!serverDateHeader) return;

  const serverTime = new Date(serverDateHeader).getTime();
  if (Number.isNaN(serverTime)) return;

  offsetMs = serverTime - Date.now();
}

export function getServerNow() {
  return new Date(Date.now() + offsetMs);
}
