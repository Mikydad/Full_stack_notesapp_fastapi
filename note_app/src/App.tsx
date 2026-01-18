import { useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import { Routes, Route } from "react-router-dom";
import Signup from './auth/Signup';
import Login from './auth/Login'
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './auth/ProtectedRoute';
import PublicRoute from './auth/PublicRoute';
function App() {

  return (
    <Routes>
      <Route path='/' element={<HomePage />}></Route>
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>}></Route>
    </Routes>
  )
}

export default App
