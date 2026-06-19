import {
  getActivities,
  getActivityYears,
  getCertifiedRss,
  getProfile,
  getUserComments,
  getUserLikes,
} from "@/api/services/profile";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const useUserProfile = (userId: number) =>
  useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => getProfile(userId),
    enabled: !!userId,
  });

export const useActivities = (userId: number, year: number) =>
  useQuery({
    queryKey: ["activities", userId, year],
    queryFn: () => getActivities(userId, year),
    enabled: !!userId,
  });

export const useActivityYears = (userId: number) =>
  useQuery({
    queryKey: ["activityYears", userId],
    queryFn: () => getActivityYears(userId),
    enabled: !!userId,
  });

export const useCertifiedRss = (userId: number) =>
  useQuery({
    queryKey: ["certifiedRss", userId],
    queryFn: () => getCertifiedRss(userId),
    enabled: !!userId,
  });

export const useUserLikes = (userId: number) =>
  useInfiniteQuery({
    queryKey: ["userLikes", userId],
    queryFn: ({ pageParam }) => getUserLikes(userId, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.lastId : undefined),
    enabled: !!userId,
  });

export const useUserComments = (userId: number) =>
  useInfiniteQuery({
    queryKey: ["userComments", userId],
    queryFn: ({ pageParam }) => getUserComments(userId, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.lastId : undefined),
    enabled: !!userId,
  });
