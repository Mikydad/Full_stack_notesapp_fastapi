import React, { type ReactNode, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, loading } = useContext(AuthContext);

  // 1️⃣ Wait until context finishes loading
  if (loading) {
    return <div>Loading...</div>; // or a spinner
  }

  // 2️⃣ Redirect if not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 3️⃣ Render protected page
  return children;
}

export default ProtectedRoute;
