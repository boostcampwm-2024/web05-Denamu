import { ADMIN } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { AdminRss, AdminResponse, AdminRequest } from "@/types/rss";

export const admin = {
  //대기중인 rss 정보 get
  getRss: async (): Promise<AdminRss> => {
    const response = await axiosInstance.get<AdminRss>(ADMIN.GET.RSS);
    return response.data;
  },
  //승인된 rss 정보 get
  getAccept: async (): Promise<AdminRss> => {
    const response = await axiosInstance.get<AdminRss>(ADMIN.GET.ACCEPT);
    return response.data;
  },
  //거부된 rss 정보 get
  getReject: async (): Promise<AdminRss> => {
    const response = await axiosInstance.get<AdminRss>(ADMIN.GET.REJECT);
    return response.data;
  },
  //rss 승인
  acceptRss: async (data: AdminRequest): Promise<AdminResponse> => {
    const response = await axiosInstance.post(`${ADMIN.ACTION.ACCEPT}/${data.id}`);
    return response.data;
  },
  //rss 거부
  rejectRss: async (data: AdminRequest): Promise<AdminResponse> => {
    const response = await axiosInstance.post(`${ADMIN.ACTION.REJECT}/${data.id}`, { description: data.rejectMessage });
    return response.data;
  },
};
