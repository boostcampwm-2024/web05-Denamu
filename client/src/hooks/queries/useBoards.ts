import { getBoard, getBoards, GetBoardsParams } from "@/api/services/board";
import { useQuery } from "@tanstack/react-query";

export const useBoards = (params: GetBoardsParams, enabled = true) => {
  return useQuery({
    queryKey: ["boards", params],
    queryFn: () => getBoards(params),
    enabled,
  });
};

export const useBoard = (id: number | null) => {
  return useQuery({
    queryKey: ["board", id],
    queryFn: () => getBoard(id as number),
    enabled: id !== null,
  });
};
