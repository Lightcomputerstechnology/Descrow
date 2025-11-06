// File: src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';

// Public Pages
import VerifyEmail from './pages/VerifyEmail';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUpPage from './pages/SignUpPage';
import ForgotPassword from './pages/ForgotPassword';
import ResendVerification from './pages/ResendVerification';
import ResetPassword from './pages/ResetPassword';

// User Pages
import UnifiedDashboard from './pages/UnifiedDashboard';
import EscrowDetails from './pages/EscrowDetails';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import TransactionsPage from './pages/admin/TransactionsPage';
import DisputesPage from './pages/admin/DisputesPage';
import UsersPage from './pages/admin/UsersPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import PaymentGatewaysPage from './pages/admin/PaymentGatewaysPage';
import APIManagementPage from './pages/admin/APIManagementPage';
import AdminManagementPage from './pages/admin/AdminManagementPage';

import { authService } from './services/authService';

function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.verified) {
        setUser(currentUser);
      }

      const adminToken = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('admin');
      if (adminToken && adminData) {
        try {
          setAdmin(JSON.parse(adminData));
        } catch (err) {
          console.error('Invalid admin data');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('admin');
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // Protected Route Component for Users
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (!user.verified) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  // Admin Protected Route Component
  const AdminProtectedRoute = ({ children, requiredPermission }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      );
    }

    if (!admin) {
      return <Navigate to="/admin/login" replace />;
    }

    if (requiredPermission && admin.role !== 'master' && !admin.permissions?.[requiredPermission]) {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
  };

  // Check if current route is admin or public (no navbar needed)
  const showNavbar = () => {
    const path = window.location.pathname;
    const noNavbarRoutes = [
      '/login',
      '/signup',
      '/verify-email',
      '/forgot-password',
      '/reset-password',
      '/admin'
    ];
    return !noNavbarRoutes.some(route => path.startsWith(route));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {showNavbar() && <Navbar user={user} />}
      
      <Routes>
        {/* ==================== PUBLIC ROUTES ==================== */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" replace /> : <SignUpPage setUser={setUser} />}
        />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ==================== USER ROUTES (Protected) ==================== */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UnifiedDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/escrow/:id"
          element={
            <ProtectedRoute>
              <EscrowDetails />
            </ProtectedRoute>
          }
            <Route path="/resend-verification" element={<ResendVerification />} />
        />

        {/* Legacy routes - redirect to new unified dashboard */}
        <Route path="/buyer-dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/seller-dashboard" element={<Navigate to="/dashboard" replace />} />

        {/* ==================== ADMIN ROUTES ==================== */}
        <Route
          path="/admin/login"
          element={admin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin setAdmin={setAdmin} />}
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard admin={admin} />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <AdminProtectedRoute requiredPermission="viewTransactions">
              <TransactionsPage admin={admin} />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/disputes"
          element={
            <AdminProtectedRoute requiredPermission="manageDisputes">
              <DisputesPage admin={admin} />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute requiredPermission="verifyUsers">
              <UsersPage admin={admin} />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AdminProtectedRoute requiredPermission="viewAnalytics">
              <AnalyticsPage admin={admin} />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <AdminProtectedRoute requiredPermission="managePayments">
              <PaymentGatewaysPage admin={admin} />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/api"
          element={
            <AdminProtectedRoute requiredPermission="manageAPI">
              <APIManagementPage admin={admin} />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/admins"
          element={
            <AdminProtectedRoute requiredPermission="manageAdmins">
              <AdminManagementPage admin={admin} />
            </AdminProtectedRoute>
          }
        />

        {/* ==================== CATCH ALL ==================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
