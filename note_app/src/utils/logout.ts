import type { AuthContextType } from "../auth/AuthContext";
import type { NavigateFunction } from "react-router-dom";

export const logout = (
  setToken: AuthContextType["setToken"],
  navigate: NavigateFunction
) => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  setToken(null);
  navigate("/login");
};
