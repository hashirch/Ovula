import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import AddLog from './pages/AddLog';
import LogsHistory from './pages/LogsHistory';
import CycleTracker from './pages/CycleTracker';
import Insights from './pages/Insights';
import Chat from './pages/Chat';
import PCOSPrediction from './pages/PCOSPrediction';
import Profile from './pages/Profile';
import DietNutrition from './pages/DietNutrition';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF0F3] via-[#FFE4E9] to-[#FFD1DC]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-500"></div>
          <p className="text-pink-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF0F3] via-[#FFE4E9] to-[#FFD1DC]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-500"></div>
          <p className="text-pink-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? <Navigate to="/" /> : children;
};

// Layout with Sidebar for protected routes
const AppLayout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            {/* Public Routes (No Sidebar) */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            {/* Protected Routes (With Sidebar) */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/add-log" element={
              <ProtectedRoute>
                <AppLayout>
                  <AddLog />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/logs-history" element={
              <ProtectedRoute>
                <AppLayout>
                  <LogsHistory />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/cycle-tracker" element={
              <ProtectedRoute>
                <AppLayout>
                  <CycleTracker />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/insights" element={
              <ProtectedRoute>
                <AppLayout>
                  <Insights />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <AppLayout>
                  <Chat />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/pcos-prediction" element={
              <ProtectedRoute>
                <AppLayout>
                  <PCOSPrediction />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/diet-nutrition" element={
              <ProtectedRoute>
                <AppLayout>
                  <DietNutrition />
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(236, 72, 153, 0.1)',
                boxShadow: '0 4px 24px 0 rgba(236, 72, 153, 0.1)',
                borderRadius: '16px',
                padding: '16px',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
