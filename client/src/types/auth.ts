import { ApiData, ApiMessage } from "@/types/api";

export type AdminAuthRequest = {
  email: string;
  password: string;
};

export type AdminAuthResponse = ApiMessage;

export type AdminProfileResponse = ApiData<{
  email: string;
  name: string;
  emailNotification: boolean;
  parent: { email: string; name: string } | null;
}>;

export type AdminUpdateRequest = {
  name?: string;
  password?: string;
  emailNotification?: boolean;
};

export type AdminUpdateResponse = ApiMessage;

export type AdminForgotPasswordRequest = {
  email: string;
};

export type AdminResetPasswordRequest = {
  token: string;
  password: string;
};

export interface UserSignUpRequest {
  email: string;
  password: string;
  userName: string;
}

export type UserSignUpResponse = ApiMessage;

export interface UserSignInRequest {
  email: string;
  password: string;
}

export interface UserSignInResponse extends ApiMessage {
  data?: {
    accessToken: string;
  };
}

export interface SignUpForm {
  email: string;
  password: string;
  userName: string;
}

export interface SignUpResult {
  success: boolean;
  message: string;
  status?: number;
}

export interface SignInForm {
  email: string;
  password: string;
}

export interface SignInResult {
  success: boolean;
  message: string;
  accessToken?: string;
  status?: number;
}

export interface ForgotPasswordResult {
  success: boolean;
  message: string;
}
export interface ResetPasswordResult {
  success: boolean;
  message: string;
  status?: number;
}