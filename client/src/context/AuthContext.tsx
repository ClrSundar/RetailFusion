// client/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

type User = { id: string; email: string; name: string };

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRefresh = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedRefresh && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (jwtToken: string, refreshToken: string, userData: User) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  // Refresh access token
  const refreshToken = async (): Promise<string | null> => {
    const storedRefresh = localStorage.getItem("refreshToken");
    if (!storedRefresh) return null;

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
        refreshToken: storedRefresh,
      });
      const newToken = res.data.token;
      setToken(newToken);
      localStorage.setItem("token", newToken);
      return newToken;
    } catch (err) {
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
