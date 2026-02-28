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