// File: src/components/Footer.jsx
import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 items-center text-center md:text-left">

        {/* Social Icons */}
        <div className="flex justify-center md:justify-start space-x-4">
          <a 
            href="https://facebook.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Facebook"
            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 transform hover:scale-110"
          >
            <FaFacebookF className="w-5 h-5" />
          </a>
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Twitter"
            className="text-gray-500 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 transform hover:scale-110"
          >
            <FaTwitter className="w-5 h-5" />
          </a>
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="Instagram"
            className="text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-all duration-200 transform hover:scale-110"
          >
            <FaInstagram className="w-5 h-5" />
          </a>
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            aria-label="LinkedIn"
            className="text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-500 transition-all duration-200 transform hover:scale-110"
          >
            <FaLinkedinIn className="w-5 h-5" />
          </a>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center md:justify-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <Link 
            to="/about" 
            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors duration-200"
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors duration-200"
          >
            Contact
          </Link>
          <Link 
            to="/privacy-policy" 
            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <Link 
            to="/docs" 
            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors duration-200"
          >
            Docs
          </Link>
          <Link 
            to="/faq" 
            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors duration-200"
          >
            FAQ
          </Link>
          <Link 
            to="/blog" 
            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors duration-200"
          >
            Blog
          </Link>
          <Link 
            to="/referral" 
            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors duration-200"
          >
            Referral
          </Link>
          <Link 
            to="/terms" 
            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors duration-200"
          >
            Terms
          </Link>
          <Link 
            to="/refund-policy" 
            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors duration-200"
          >
            Refund Policy
          </Link>
          <Link 
            to="/careers" 
            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors duration-200"
          >
            Careers
          </Link>
          <Link 
            to="/api" 
            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors duration-200"
          >
            API
          </Link>
          <Link 
            to="/cookies" 
            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors duration-200"
          >
            Cookie Policy
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-gray-500 dark:text-gray-400 text-sm text-center md:text-right">
          &copy; {new Date().getFullYear()} Dealcross. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;