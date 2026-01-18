import React from 'react'
import { createContext, useState, useEffect, ReactNode } from 'react'

interface AuthContexType {
    token: string | null,
    setToken: (token: string | null) => void;
    isLoggedIn: boolean;
}

export const AuthContexts = createContext<AuthContexType>({
    token: null,
    setToken: () => {},
    isLoggedIn: false
})
function AuthContext({ children } : {children: ReactNode}) {
const [token, setToken] = useState<string | null>(null);


  useEffect( () => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken)
  }, []);

  const isLoggedIn = !!token;
  
  return (
    <AuthContexts.Provider value={{ token, setToken, isLoggedIn }}>
      {children}
    </AuthContexts.Provider>
  );

}


export default AuthContext