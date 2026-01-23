import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

function PublicRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, loading } = useAuth();

  // Wait for auth to finish loading before making redirect decisions
  if (loading) {
    return <div>Loading...</div>;
  }

  // If user is already logged in, redirect to /category
  if (isLoggedIn) {
    return <Navigate to="/category" replace />;
  }

  // User is not logged in, show the public route (login/signup forms)
  return <>{children}</>;
}

export default PublicRoute;