// File: src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { useUser } from '../context/UserContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    setMobileMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <nav className={`sticky top-0 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg' : 'shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Shield className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              Dealcross
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
              Home
            </Link>
            <Link to="/deals" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
              Deals
            </Link>
            <Link to="/share-trading" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
              Share Trading
            </Link>
            <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
              Contact
            </Link>
            <Link to="/docs" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
              Docs
            </Link>
            <Link to="/upgrade" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200 font-semibold">
              Upgrade
            </Link>
            
            {/* Signed-in user quick links */}
            {!loading && user && (
              <>
                <Link to="/wallet" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link to="/admin-dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Desktop Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            
            {!loading && !user ? (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-2 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold transition-all duration-200"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-900 dark:text-white" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto z-50 transition-colors duration-300"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-blue-500" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                      Dealcross
                    </span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <Link 
                    to="/" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="block text-lg text-blue-500 font-medium transition-colors duration-200"
                  >
                    Home
                  </Link>
                  <Link 
                    to="/deals" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="block text-lg text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    Deals
                  </Link>
                  <Link 
                    to="/share-trading" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="block text-lg text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    Share Trading
                  </Link>
                  <Link 
                    to="/contact" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="block text-lg text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    Contact
                  </Link>
                  <Link 
                    to="/docs" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="block text-lg text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    Docs
                  </Link>
                  <Link 
                    to="/upgrade" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="block text-lg text-blue-500 font-medium transition-colors duration-200"
                  >
                    Upgrade
                  </Link>

                  {!loading && user && (
                    <>
                      <Link 
                        to="/wallet" 
                        onClick={() => setMobileMenuOpen(false)} 
                        className="block text-lg text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
                      >
                        Dashboard
                      </Link>
                      {isAdmin && (
                        <Link 
                          to="/admin-dashboard" 
                          onClick={() => setMobileMenuOpen(false)} 
                          className="block text-lg text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
                        >
                          Admin
                        </Link>
                      )}
                    </>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
                  {!loading && !user ? (
                    <>
                      <button
                        onClick={() => {
                          navigate('/login');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 mb-3"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          navigate('/signup');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full px-6 py-3 border-2 border-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                      >
                        Sign Up
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleLogout}
                      className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold transition-all duration-200"
                    >
                      Logout
                    </button>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Theme</span>
                    <ThemeToggle />
                  </div>
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
