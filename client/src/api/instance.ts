import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

export const axiosInstance = axios.create({
  baseURL: "https://denamu.site",
  timeout: 10000,
  withCredentials: true,
});
