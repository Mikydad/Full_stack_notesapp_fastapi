import React, { type ReactNode, useState, useEffect, createContext } from "react";

export interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isLoggedIn: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  isLoggedIn: false,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
    setLoading(false);
  }, []);

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ token, setToken, isLoggedIn, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
