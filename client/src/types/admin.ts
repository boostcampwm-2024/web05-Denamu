import { ApiData, ApiMessage } from "@/types/api";

export type RegisterRequest = {
  password: string;
  name: string;
  email: string;
};

export type RegisterResponse = ApiMessage;

export type ChildAdmin = {
  id: number;
  email: string;
  name: string;
};

export type ChildAdminResponse = ApiData<ChildAdmin[]>;

export type DeleteChildResponse = ApiMessage;
