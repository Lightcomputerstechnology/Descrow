// File: src/components/HeroSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Shield, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 dark:from-gray-900 dark:via-blue-950 dark:to-black py-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('welcome_to_dealcross') || 'Secure Escrow Payments'}<br />
            {t('subtitle') || 'for Global Trade'}
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            {t('your_trusted_escrow') || 'Protect your online transactions with our trusted escrow service. Buy and sell with confidence, anywhere in the world.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 text-lg flex items-center justify-center gap-2"
            >
              {t('get_started') || 'Get Started Free'}
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 text-lg"
            >
              {t('learn_more') || 'See How It Works'}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-blue-100">10,000+ Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-blue-100">Bank-Level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-blue-100">150+ Countries</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
