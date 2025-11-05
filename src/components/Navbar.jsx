// File: src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../assets/dealcross-logo.png';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { useUser } from '../context/UserContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { user, isAdmin, signOut, loading } = useUser();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <nav className={`bg-white dark:bg-gray-900 relative z-50 transition-shadow duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src={Logo} alt="Dealcross" className="h-8 w-auto mr-2" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">Dealcross</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex space-x-6 text-gray-700 dark:text-gray-300">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Home
          </Link>
          <Link to="/deals" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Deals
          </Link>
          <Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Contact
          </Link>
          <Link to="/upgrade" className="hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors">
            Upgrade
          </Link>
          
          {!loading && user && (
            <>
              <Link to="/wallet" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Dashboard
              </Link>
              {isAdmin && (
                <Link to="/admin-dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Admin
                </Link>
              )}
            </>
          )}
        </div>

        {/* Desktop Right Controls */}
        <div className="hidden md:flex items-center space-x-3">
          {!loading && !user ? (
            <>
              <Link 
                to="/login" 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-md transition-colors"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-sm rounded-md transition-colors"
            >
              Logout
            </button>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile: Theme + Menu Button Only */}
        <div className="flex items-center md:hidden space-x-2">
          <ThemeToggle />
          <button 
            onClick={() => setOpen(!open)} 
            aria-label="Toggle menu"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {open ? (
              <X className="h-6 w-6 text-gray-900 dark:text-white" />
            ) : (
              <Menu className="h-6 w-6 text-gray-900 dark:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />
            
            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 w-3/4 h-full bg-white dark:bg-gray-900 p-6 z-50 shadow-2xl overflow-y-auto"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center" onClick={() => setOpen(false)}>
                  <img src={Logo} alt="Dealcross" className="h-8 w-auto mr-2" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Dealcross</span>
                </Link>
                <button onClick={() => setOpen(false)}>
                  <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-4 mb-6 text-lg font-medium">
                <Link 
                  to="/" 
                  onClick={() => setOpen(false)} 
                  className="block text-blue-600 dark:text-blue-400 transition-colors"
                >
                  Home
                </Link>
                <Link 
                  to="/deals" 
                  onClick={() => setOpen(false)} 
                  className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Deals
                </Link>
                <Link 
                  to="/contact" 
                  onClick={() => setOpen(false)} 
                  className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Contact
                </Link>
                <Link 
                  to="/upgrade" 
                  onClick={() => setOpen(false)} 
                  className="block text-blue-600 dark:text-blue-400 font-semibold transition-colors"
                >
                  Upgrade
                </Link>

                {!loading && user && (
                  <>
                    <Link 
                      to="/wallet" 
                      onClick={() => setOpen(false)} 
                      className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link 
                        to="/admin-dashboard" 
                        onClick={() => setOpen(false)} 
                        className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        Admin
                      </Link>
                    )}
                  </>
                )}
              </div>

              {/* Authentication Section */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mb-6">
                {!loading && !user ? (
                  <div className="space-y-3">
                    <Link 
                      to="/login" 
                      onClick={() => setOpen(false)} 
                      className="block w-full px-4 py-3 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      onClick={() => setOpen(false)} 
                      className="block w-full px-4 py-3 bg-gray-800 text-white text-center rounded-md hover:bg-gray-700 transition-colors font-semibold"
                    >
                      Sign Up
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md transition-colors font-semibold text-gray-900 dark:text-white"
                  >
                    Logout
                  </button>
                )}
              </div>

              {/* Settings Section */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
                  <ThemeToggle />
                </div>
                <div>
                  <LanguageSwitcher />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}