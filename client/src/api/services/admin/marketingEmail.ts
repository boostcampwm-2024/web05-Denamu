import { FILE, MARKETING_EMAIL } from "@/constants/endpoints";

import { axiosInstance } from "@/api/instance";
import { ApiData } from "@/types/api";
import { MarketingEmailPage, MarketingEmailSummary, SendMarketingEmailPayload } from "@/types/marketingEmail";

export interface GetAdminMarketingEmailsParams {
  page?: number;
  limit?: number;
}

export const adminMarketingEmail = {
  getList: async (params: GetAdminMarketingEmailsParams): Promise<MarketingEmailPage<MarketingEmailSummary>> => {
    const response = await axiosInstance.get<ApiData<MarketingEmailPage<MarketingEmailSummary>>>(
      MARKETING_EMAIL.ADMIN_LIST,
      { params }
    );
    return response.data.data;
  },
  send: async (payload: SendMarketingEmailPayload): Promise<MarketingEmailSummary> => {
    const response = await axiosInstance.post<ApiData<MarketingEmailSummary>>(MARKETING_EMAIL.ADMIN_LIST, payload);
    return response.data.data;
  },
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post<ApiData<{ url: string }>>(FILE.ADMIN_UPLOAD_IMAGE, formData, {
      params: { uploadType: "MARKETING_EMAIL_IMAGE" },
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data.url;
  },
};
