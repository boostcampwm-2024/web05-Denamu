import { adminMarketingEmail, GetAdminMarketingEmailsParams } from "@/api/services/admin/marketingEmail";
import { SendMarketingEmailPayload } from "@/types/marketingEmail";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const LIST_KEY = "adminMarketingEmails";

export const useAdminMarketingEmails = (params: GetAdminMarketingEmailsParams) => {
  return useQuery({
    queryKey: [LIST_KEY, params],
    queryFn: () => adminMarketingEmail.getList(params),
  });
};

export const useSendMarketingEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendMarketingEmailPayload) => adminMarketingEmail.send(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LIST_KEY] });
    },
  });
};
