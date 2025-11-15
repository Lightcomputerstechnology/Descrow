// File: src/components/Footer.jsx - FINAL PRODUCTION + SEO OPTIMIZED
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGithub } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Contact', path: '/contact' },
      { name: 'Blog', path: '/blog' },
    ],
    product: [
      { name: 'How It Works', path: '/#how-it-works' },
      { name: 'API Documentation', path: '/api' },
      { name: 'Referral Program', path: '/referral' },
      { name: 'FAQ', path: '/faq' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy-policy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
    ],
  };

  const socialLinks = [
    { icon: FaFacebookF, url: 'https://facebook.com/dealcross', label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: FaTwitter, url: 'https://twitter.com/dealcross', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: FaInstagram, url: 'https://instagram.com/dealcross', label: 'Instagram', color: 'hover:text-pink-500' },
    { icon: FaLinkedinIn, url: 'https://linkedin.com/company/dealcross', label: 'LinkedIn', color: 'hover:text-blue-700' },
    { icon: FaGithub, url: 'https://github.com/dealcross', label: 'GitHub', color: 'hover:text-gray-900 dark:hover:text-white' },
  ];

  return (
    <footer
      role="contentinfo"
      className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">

          {/* Brand/About Section */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              aria-label="Dealcross Home"
              className="flex items-center mb-4 group"
            >
              <Shield className="w-8 h-8 text-blue-600 mr-2 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                Dealcross
              </span>
            </Link>

            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm leading-relaxed">
              Secure escrow platform protecting millions of transactions worldwide.
              Buy and sell with total confidence.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6" aria-label="Contact Information">
              <a
                href="mailto:support@dealcross.net"
                className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition group"
                rel="noopener noreferrer"
              >
                <Mail className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm">support@dealcross.net</span>
              </a>

              <a
                href="tel:+15551234567"
                className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition group"
                rel="noopener noreferrer"
              >
                <Phone className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </a>

              <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  123 Escrow Street<br />New York, NY 10001
                </span>
              </div>
            </div>

            {/* Social Links */}
            <nav aria-label="Social Media" className="flex space-x-4">
              {socialLinks.map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    aria-label={social.label}
                    className={`text-gray-500 dark:text-gray-400 ${social.color} transition-all duration-200 transform hover:scale-110`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Company */}
          <div aria-labelledby="footer-company">
            <h3
              id="footer-company"
              className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4"
            >
              Company
            </h3>

            <ul className="space-y-3">
              {footerLinks.company.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product */}
          <div aria-labelledby="footer-product">
            <h3
              id="footer-product"
              className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4"
            >
              Product
            </h3>

            <ul className="space-y-3">
              {footerLinks.product.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div aria-labelledby="footer-legal">
            <h3
              id="footer-legal"
              className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4"
            >
              Legal
            </h3>

            <ul className="space-y-3">
              {footerLinks.legal.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
              © {currentYear} Dealcross. All rights reserved.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <Link to="/privacy-policy" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                Terms
              </Link>
              <Link to="/cookies" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                Cookies
              </Link>
              <Link to="/docs" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                Help
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 dark:text-gray-600">
            {['256-bit SSL', 'PCI DSS Compliant', 'GDPR Compliant', 'SOC 2 Certified'].map((label, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
