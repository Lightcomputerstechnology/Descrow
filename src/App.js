import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUpPage from './pages/SignUpPage';

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

function App() {
  const [user, setUser] = useState(null); // { id, name, role: 'dual', tier: 'free' | 'basic' | 'pro' }
  const [admin, setAdmin] = useState(null); // { id, name, role: 'master' | 'sub_admin', permissions: {} }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<SignUpPage setUser={setUser} />} />

        {/* User Routes - Unified Dashboard */}
        <Route 
          path="/dashboard" 
          element={user ? <UnifiedDashboard user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/escrow/:id" 
          element={user ? <EscrowDetails user={user} /> : <Navigate to="/login" />} 
        />

        {/* Legacy routes redirect to unified dashboard */}
        <Route path="/buyer-dashboard" element={<Navigate to="/dashboard" />} />
        <Route path="/seller-dashboard" element={<Navigate to="/dashboard" />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin setAdmin={setAdmin} />} />
        <Route 
          path="/admin/dashboard" 
          element={admin ? <AdminDashboard admin={admin} /> : <Navigate to="/admin/login" />} 
        />
        <Route 
          path="/admin/transactions" 
          element={
            admin && admin.permissions.viewTransactions ? 
            <TransactionsPage admin={admin} /> : 
            <Navigate to="/admin/login" />
          } 
        />
        <Route 
          path="/admin/disputes" 
          element={
            admin && admin.permissions.manageDisputes ? 
            <DisputesPage admin={admin} /> : 
            <Navigate to="/admin/login" />
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            admin && admin.permissions.verifyUsers ? 
            <UsersPage admin={admin} /> : 
            <Navigate to="/admin/login" />
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            admin && admin.permissions.viewAnalytics ? 
            <AnalyticsPage admin={admin} /> : 
            <Navigate to="/admin/login" />
          } 
        />
        <Route 
          path="/admin/payments" 
          element={
            admin && admin.permissions.managePayments ? 
            <PaymentGatewaysPage admin={admin} /> : 
            <Navigate to="/admin/login" />
          } 
        />
        <Route 
          path="/admin/api" 
          element={
            admin && admin.permissions.manageAPI ? 
            <APIManagementPage admin={admin} /> : 
            <Navigate to="/admin/login" />
          } 
        />
        <Route 
          path="/admin/admins" 
          element={
            admin && admin.permissions.manageAdmins ? 
            <AdminManagementPage admin={admin} /> : 
            <Navigate to="/admin/login" />
          } 
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
