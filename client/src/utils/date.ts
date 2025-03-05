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

export const formatActivityDate = (date: Date): string => date.toISOString().split("T")[0]; // "2025-02-20"

export const subtractDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(date.getDate() - days);
  return result;
};

export const getShortMonthName = (date: Date): string => date.toLocaleString("en-US", { month: "short" });
