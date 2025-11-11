// client/src/api/auth.ts
import { useApi } from "./apiClient";
import { useAuth } from "../context/AuthContext";

export const useAuthApi = () => {
  const { login: setAuth, logout } = useAuth();
  const api = useApi();

  const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, refreshToken, user } = res.data;
    setAuth(token, refreshToken, user);
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await api.post("/auth/signup", { name, email, password });
    const { token, refreshToken, user } = res.data;
    setAuth(token, refreshToken, user);
  };

  const getProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      return res.data.user; // { id, name, email }
    } catch (err) {
      console.error("Failed to fetch profile", err);
      return null;
    }
  };

  return { login, signup, logout, getProfile };
};
