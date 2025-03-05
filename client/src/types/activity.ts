export interface DayInfo {
  date: Date;
  dateStr: string;
  count: number;
}

export interface WeekInfo {
  days: DayInfo[];
  weekNumber: number;
}

export interface ActivityData {
  weeks: WeekInfo[];
  months: string[];
  activityMap: Map<string, number>;
}
