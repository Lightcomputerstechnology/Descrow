// src/utils/auth.utils.js - CREATE THIS FILE

import axios from 'axios';

// Decode JWT token
export const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token) => {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  
  const currentTime = Date.now() / 1000;
  return payload.exp < currentTime;
};

// Logout and redirect
export const forceLogout = () => {
  localStorage.clear();
  window.location.href = '/login';
};
