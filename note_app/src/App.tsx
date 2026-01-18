import { Routes, Route } from "react-router-dom";
import HomePage from './pages/HomePage';
import Signup from './auth/Signup';
import Login from './auth/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './auth/ProtectedRoute';
import PublicRoute from './auth/PublicRoute';
import { AuthProvider } from './auth/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
