import { ApiData } from "@/types/api";

export type ChartType = {
  id: number;
  title: string;
  viewCount: number;
};
export type ChartResponse = ApiData<ChartType[]>;
export type ChartPlatform = {
  platform: string;
  count: number;
};
export type ChartPlatforms = ApiData<ChartPlatform[]>;
export type ChartsType = {
  chartAll: ChartResponse;
  chartToday: ChartResponse;
  chartPlatform: ChartPlatforms;
};
