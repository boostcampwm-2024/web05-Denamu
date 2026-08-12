import { SUSPENSION_PRESET_DAYS } from "@/constants/report";
import { SuspensionPreset } from "@/types/report";

export const fromDatetimeLocal = (value: string): string | undefined => {
  if (!value) return undefined;
  return new Date(value).toISOString();
};

export const toDatetimeLocal = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const presetToDatetimeLocal = (preset: SuspensionPreset): string => {
  const days = SUSPENSION_PRESET_DAYS[preset];
  if (!days) return "";
  return toDatetimeLocal(new Date(Date.now() + days * 24 * 60 * 60 * 1000));
};

export const computeSuspendedUntil = (preset: SuspensionPreset | null, dateValue: string): string | undefined => {
  if (preset === "PERMANENT") return undefined;
  return fromDatetimeLocal(dateValue);
};
