import type { AuthContextType } from "../auth/AuthContext";

export const logout = (setToken: AuthContextType["setToken"], navigate: Function) => {
  localStorage.removeItem("token");
  setToken(null);
  navigate("/login");
};
