// File: src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import ProfilePage from './pages/Profile/ProfilePage';
import NotificationsPage from './pages/NotificationsPage'; // ✅ NEW IMPORT

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

// ✅ 404 Page
const NotFound = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Page not found: {location.pathname}
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go Home
        </a>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');
      const currentUser = authService.getCurrentUser();

      if (token && currentUser && currentUser.verified) {
        setUser(currentUser);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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

  // 🔒 Protected User Route
  const ProtectedRoute = ({ children }) => {
    if (loading)
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );

    if (!user) return <Navigate to="/login" replace />;
    if (!user.verified) return <Navigate to="/login" replace />;
    return children;
  };

  // 🔒 Protected Admin Route
  const AdminProtectedRoute = ({ children, requiredPermission }) => {
    if (loading)
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      );

    if (!admin) return <Navigate to="/admin/login" replace />;
    if (requiredPermission && admin.role !== 'master' && !admin.permissions?.[requiredPermission])
      return <Navigate to="/admin/dashboard" replace />;

    return children;
  };

  // Navbar visibility
  const showNavbar = () => {
    const path = window.location.pathname;
    const noNavbarRoutes = [
      '/login',
      '/signup',
      '/verify-email',
      '/forgot-password',
      '/reset-password',
      '/resend-verification',
      '/admin',
    ];
    return !noNavbarRoutes.some(route => path.startsWith(route));
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#363636', color: '#fff' },
          success: { duration: 3000, iconTheme: { primary: '#4ade80', secondary: '#fff' } },
          error: { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
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
        <Route path="/resend-verification" element={<ResendVerification />} />

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
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Legacy Redirects */}
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

        {/* ==================== 404 ==================== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;