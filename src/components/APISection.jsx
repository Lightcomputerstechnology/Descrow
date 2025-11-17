// File: src/components/APISection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const APISection = () => {
  const navigate = useNavigate();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section id="api" className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 dark:from-black dark:via-blue-950 dark:to-black text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full mb-6 border border-blue-500/30">
              <Code className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">For Developers</span>
            </div>
            <h2 className="text-4xl font-bold mb-6">
              Powerful API for Your Platform
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Integrate Dealcross escrow into your marketplace or e-commerce platform in minutes. Simple REST API with comprehensive documentation.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                'Easy integration in any language',
                'Webhook support for real-time updates',
                'Sandbox environment for testing',
                '24/7 developer support'
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-gray-200">{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 text-lg shadow-lg"
            >
              Get API Access
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-950 rounded-2xl p-6 overflow-hidden shadow-2xl border border-gray-800"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-400 text-sm ml-4">api-example.js</span>
            </div>
            <pre className="text-sm text-green-400 overflow-x-auto">
{`// Create an escrow transaction
const response = await fetch(
  'https://api.dealcross.net/v1/escrow',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      seller: 'seller@example.com',
      item: 'MacBook Pro',
      amount: 2500,
      currency: 'USD'
    })
  }
);

const escrow = await response.json();
console.log(escrow.id); // ESC123456`}
            </pre>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default APISection;
