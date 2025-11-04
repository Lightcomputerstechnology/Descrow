// File: src/components/StartTradingCTA.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const StartTradingCTA = () => {
  const navigate = useNavigate();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-20 bg-gray-900 dark:bg-black text-white transition-colors duration-300">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Secure Your Transactions?
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join thousands of businesses and individuals who trust Dealcross for safe online transactions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 text-lg shadow-lg"
          >
            Start for Free
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 text-lg"
          >
            Login to Dashboard
          </button>
        </div>
        <p className="text-gray-400 mt-6 text-sm">
          No credit card required • Free tier available forever
        </p>
      </motion.div>
    </section>
  );
};

export default StartTradingCTA;
