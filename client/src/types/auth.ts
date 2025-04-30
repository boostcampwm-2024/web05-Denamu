export type AdminAuthRequest = {
  loginId: string;
  password: string;
};

export type AdminAuthResponse = {
  message: string;
};

export interface UserSignUpRequest {
  email: string;
  password: string;
  userName: string;
}

export interface UserSignUpResponse {
  message: string;
}

export interface UserSignInRequest {
  email: string;
  password: string;
}

export interface UserSignInResponse {
  message: string;
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
