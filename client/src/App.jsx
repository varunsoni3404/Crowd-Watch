// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { TranslationProvider } from './context/TranslationContext';

// Components
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ReportForm from './pages/ReportForm';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotificationContainer from './components/common/NotificationContainer';
import LoadingScreen from './components/common/LoadingScreen';

// CSS
import './index.css';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <TranslationProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <NotificationContainer />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/report"
                  element={
                    <ProtectedRoute>
                      <ReportForm />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
              <LoadingScreen />
            </div>
          </Router>
        </TranslationProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;