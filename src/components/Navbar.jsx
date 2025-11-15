// File: src/components/Navbar.jsx (SEO + Accessibility Refined)
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { authService } from '../services/authService';

export default function Navbar({ user: propUser }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(propUser);
  const navigate = useNavigate();

  /* ================================
     Sync user from props or storage
  ================================= */
  useEffect(() => {
    const currentUser = propUser || authService.getCurrentUser();
    setUser(currentUser);
  }, [propUser]);

  /* ================================
     Scroll shadow
  ================================= */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ================================
     Logout
  ================================= */
  const handleLogout = useCallback(() => {
    authService.logout();
    setOpen(false);
    navigate('/login', { replace: true });
  }, [navigate]);

  const isAdmin = user?.role === 'admin' || user?.isAdmin;

  return (
    <nav
      className={`bg-white dark:bg-gray-900 sticky top-0 z-50 transition-shadow duration-300 ${
        scrolled ? 'shadow-lg' : 'shadow-sm'
      } border-b border-gray-200 dark:border-gray-800`}
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ================================
              LOGO (SEO: brand link, aria-label)
          ================================= */}
          <Link
            to="/"
            aria-label="Go to Dealcross homepage"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <Shield className="w-8 h-8 text-blue-600 mr-2" aria-hidden="true" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Dealcross
            </span>
          </Link>

          {/* ================================
              DESKTOP NAVIGATION
          ================================= */}
          <div className="hidden md:flex items-center space-x-1" role="menubar">
            {[
              { to: '/', label: 'Home' },
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                role="menuitem"
                className="px-3 py-2 text-gray-700 dark:text-gray-300 
                hover:text-blue-600 dark:hover:text-blue-400 
                hover:bg-gray-100 dark:hover:bg-gray-800 
                rounded-lg transition font-medium"
              >
                {item.label}
              </Link>
            ))}

            {user && (
              <>
                <Link
                  to="/dashboard"
                  role="menuitem"
                  className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 
                  dark:hover:text-blue-400 hover:bg-gray-100 
                  dark:hover:bg-gray-800 rounded-lg transition font-medium"
                >
                  Dashboard
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    role="menuitem"
                    className="px-3 py-2 text-gray-700 dark:text-gray-300 
                    hover:text-blue-600 dark:hover:text-blue-400 
                    hover:bg-gray-100 dark:hover:bg-gray-800 
                    rounded-lg transition font-medium"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* ================================
              DESKTOP AUTH BUTTONS
          ================================= */}
          <div className="hidden md:flex items-center space-x-3">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 
                    hover:bg-gray-100 dark:hover:bg-gray-800 
                    rounded-lg font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 
                  text-white rounded-lg font-medium transition shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 
                hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 
                dark:text-white rounded-lg font-medium transition"
              >
                Logout
              </button>
            )}
            <ThemeToggle />
          </div>

          {/* ================================
              MOBILE MENU BUTTON
          ================================= */}
          <div className="flex items-center md:hidden space-x-2">
            <ThemeToggle />

            <button
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Toggle mobile navigation"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              {open ? (
                <X className="h-6 w-6 text-gray-900 dark:text-white" />
              ) : (
                <Menu className="h-6 w-6 text-gray-900 dark:text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================================
          MOBILE SIDEBAR
      ================================= */}
      <AnimatePresence>
        {open && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* SIDEBAR */}
            <motion.aside
              id="mobile-menu"
              role="menu"
              aria-label="Mobile Navigation Menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-900 
              p-6 z-50 shadow-2xl overflow-y-auto md:hidden"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between mb-8">
                <Link
                  to="/"
                  className="flex items-center"
                  onClick={() => setOpen(false)}
                >
                  <Shield className="w-8 h-8 text-blue-600 mr-2" aria-hidden="true" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    Dealcross
                  </span>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Sidebar Links */}
              <div className="space-y-2 mb-6">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/about', label: 'About' },
                  { to: '/contact', label: 'Contact' },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-gray-900 dark:text-white 
                    hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition 
                    font-medium"
                  >
                    {link.label}
                  </Link>
                ))}

                {user && (
                  <>
                    <Link
                      to="/dashboard"
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 text-gray-700 dark:text-gray-300 
                      hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                      Dashboard
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        role="menuitem"
                        onClick={() => setOpen(false)}
                        className="block px-4 py-3 text-gray-700 dark:text-gray-300 
                        hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                      >
                        Admin
                      </Link>
                    )}
                  </>
                )}
              </div>

              {/* AUTH SECTION */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                {!user ? (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="block w-full px-4 py-3 text-center text-gray-700 
                      dark:text-gray-300 bg-gray-100 dark:bg-gray-800 
                      hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition 
                      font-semibold"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setOpen(false)}
                      className="block w-full px-4 py-3 text-center bg-blue-600 
                      hover:bg-blue-700 text-white rounded-lg transition 
                      font-semibold shadow-sm"
                    >
                      Sign Up
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-800 
                    hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition 
                    font-semibold text-gray-900 dark:text-white"
                  >
                    Logout
                  </button>
                )}
              </div>

            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}