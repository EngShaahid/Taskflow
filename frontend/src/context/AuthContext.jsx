import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

// Context = a shared value any component can read,
// without passing props through every level in between.
const AuthContext = createContext();

// Custom hook so components write useAuth() instead of useContext(AuthContext)
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // "loading" prevents a flash of the login page on refresh,
  // while we check whether a stored token exists.
  const [loading, setLoading] = useState(true);

  // Runs once when the app mounts.
  // Restores the session from localStorage after a page refresh.
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);

    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });

    // Register also returns a token, so the user is logged in immediately
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);

    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};