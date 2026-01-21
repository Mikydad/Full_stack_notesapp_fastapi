import { Routes, Route } from "react-router-dom";
import HomePage from './pages/HomePage';
import Signup from './auth/Signup';
import Login from './auth/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './auth/ProtectedRoute';
import PublicRoute from './auth/PublicRoute';
import { AuthProvider } from './auth/AuthContext';
import RoleRoute from "./auth/RoleRoute";
import CategoryPage from "./pages/CategoryPage";
import CategoryDetail from "./components/CategoryDetail";
import NoteDetailPage from "./pages/NoteDetailPage";

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
          path='/category'
          element={
            <ProtectedRoute>
              <CategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/category/:categoryId'
          element={
            <ProtectedRoute>
              <CategoryDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path='/note/:noteId'
          element={
            <ProtectedRoute>
              <NoteDetailPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;