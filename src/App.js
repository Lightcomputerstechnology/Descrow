import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import EscrowDetails from './pages/EscrowDetails';

function App() {
  const [user, setUser] = useState(null); // { id, name, role: 'buyer' | 'seller', tier: 'free' | 'basic' | 'pro' }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route 
          path="/buyer-dashboard" 
          element={user?.role === 'buyer' ? <BuyerDashboard user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/seller-dashboard" 
          element={user?.role === 'seller' ? <SellerDashboard user={user} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/escrow/:id" 
          element={user ? <EscrowDetails user={user} /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
