import React, { type ReactNode, useState, useEffect, createContext, useContext } from "react";

export interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isLoggedIn: boolean;
  role: string | null;
  loading: boolean;
  setAuth: (token: string | null, role: string | null) => void;

}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  isLoggedIn: false,
  role: null,
  loading: true,
  setAuth: () => {}, // placeholder function
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");
    if (savedToken && savedRole) {
      setToken(savedToken);
      setRole(savedRole);
    }
    setLoading(false);
  }, []);

  const isLoggedIn = !!token;
  if (loading) return <div>Loading auth...</div>;


  // ✅ The main setAuth function
  const setAuth = (token: string | null, role: string | null) => {
    if (token && role) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    }
    setToken(token);
    setRole(role);
  };

  return (
    <AuthContext.Provider
      value={{ token, role, isLoggedIn, loading, setToken, setAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

