// File: src/context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in (from localStorage or your auth system)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check localStorage for user data
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  // Sign in function
  const signIn = async (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Sign in failed:', error);
      return { success: false, error };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return { success: true };
    } catch (error) {
      console.error('Sign out failed:', error);
      return { success: false, error };
    }
  };

  const value = {
    user,
    isAdmin,
    loading,
    signIn,
    signOut
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
