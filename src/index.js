// File: src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { UserProvider } from './context/UserContext';
import App from './App';
import './index.css';
import './i18n'; // Initialize translations

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <UserProvider>
          <App />
          {/* ✅ Global Toast Notifications */}
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#fff',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '0.95rem',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#1e293b',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#1e293b',
                },
              },
            }}
          />
        </UserProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);