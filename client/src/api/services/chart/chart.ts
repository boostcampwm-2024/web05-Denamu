import { CHART } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ChartResponse, ChartPlatforms } from "@/types/chart";

export const chart = {
  //금일 조회수
  getToday: async (): Promise<ChartResponse> => {
    const response = await axiosInstance.get<ChartResponse>(CHART.TODAY);
    return response.data;
  },
  //전체 조회수
  getAll: async (): Promise<ChartResponse> => {
    const response = await axiosInstance.get<ChartResponse>(CHART.ALL);
    return response.data;
  },
  //등록된 플렛폼 개수
  getPlatform: async (): Promise<ChartPlatforms> => {
    const response = await axiosInstance.get<ChartPlatforms>(CHART.PLATFORM);
    return response.data;
  },
};
