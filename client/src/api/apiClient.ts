// client/src/api/apiclient.ts
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export const useApi = () => {
  const { token, logout, refreshToken } = useAuth();

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
  });

  // Attach token to request headers
  api.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Refresh token on 401
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const newToken = await refreshToken(); // ✅ Await here!
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          logout();
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
};
