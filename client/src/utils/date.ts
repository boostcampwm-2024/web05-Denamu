export const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) {
    return "-";
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "-";
    }
    return date.toLocaleDateString("en-CA");
  } catch (error) {
    console.error("Date formatting error:", error);
    return "-";
  }
};

export const detailFormatDate = (dateString: string | undefined | null) => {
  if (!dateString) {
    return "-";
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "-";
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "-";
  }
};

export const formatActivityDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const subtractDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(date.getDate() - days);
  return result;
};

export const getShortMonthName = (date: Date): string => date.toLocaleString("en-US", { month: "short" });

export const getLocalDateString = (timestamp: string): string | null => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-CA");
};

export const getLocalMinuteKey = (timestamp: string): string | null => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
};
