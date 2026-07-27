import { notifications } from "@/api/services/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const UNREAD_COUNT_KEY = ["notifications", "unread-count"];
const LIST_KEY = ["notifications", "list"];
const UNREAD_COUNT_POLL_MS = 60000;

export const useUnreadNotificationCount = (enabled: boolean) => {
  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: notifications.getUnreadCount,
    enabled,
    refetchInterval: enabled ? UNREAD_COUNT_POLL_MS : false,
  });
};

export const useNotificationList = (enabled: boolean) => {
  return useQuery({
    queryKey: LIST_KEY,
    queryFn: notifications.getList,
    enabled,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notifications.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
};
