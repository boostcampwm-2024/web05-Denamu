export type ChartType = {
  id: number;
  title: string;
  viewCount: number;
};
export type ChartResponse = {
  message: string;
  data: ChartType[];
};
export type ChartPlatform = {
  platform: string;
  count: number;
};
export type ChartPlatforms = {
  message: string;
  data: ChartPlatform[];
};
export type ChartsType = {
  chartAll: ChartResponse;
  chartToday: ChartResponse;
  chartPlatform: ChartPlatforms;
};
