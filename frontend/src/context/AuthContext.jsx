import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import apiClient from "../api/axios";
import { ROUTES } from "../constants/routes";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(sessionStorage.getItem("camtrace_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check expiry
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          // In a real app we might fetch full user profile, but JWT has sub and role
          setUser({ id: decoded.sub, role: decoded.role });
          sessionStorage.setItem("camtrace_token", token);
        }
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (employee_id, password) => {
    const response = await apiClient.post("/auth/login", { employee_id, password });
    const newToken = response.data.access_token;
    setToken(newToken);
    sessionStorage.setItem("camtrace_token", newToken);
    const decoded = jwtDecode(newToken);
    return decoded.role;
  };

  const logout = async () => {
    try {
        if (token) {
            await apiClient.post("/auth/logout");
        }
    } catch (e) { 
        /* ignore */ 
    } finally {
        setToken(null);
        setUser(null);
        sessionStorage.removeItem("camtrace_token");
        window.location.href = ROUTES.LOGIN;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
