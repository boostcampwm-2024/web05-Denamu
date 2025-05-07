import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  id: number;
  email: string;
  userName: string;
  role: string;
  exp: number;
  iat: number;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export const removeStoredToken = (): void => {
  localStorage.removeItem("accessToken");
};
