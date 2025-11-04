// File: src/components/TrustLevels.jsx
import React from 'react';
import { Shield, MessageSquare, Package, CheckCircle, Globe, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const TrustLevels = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const features = [
    {
      icon: Shield,
      title: 'Secure Escrow',
      description: 'Your money is held safely until delivery is confirmed. No fraud, no scams.'
    },
    {
      icon: MessageSquare,
      title: 'Real-time Chat',
      description: 'Communicate directly with buyers and sellers within the platform.'
    },
    {
      icon: Package,
      title: 'Delivery Tracking',
      description: 'Track your package with GPS, photos, and delivery proof.'
    },
    {
      icon: CheckCircle,
      title: 'Dispute Resolution',
      description: 'Our team resolves disputes fairly within 24-48 hours.'
    },
    {
      icon: Globe,
      title: 'Multi-Currency',
      description: 'Support for USD, EUR, GBP, NGN, and 10+ major currencies.'
    },
    {
      icon: Lock,
      title: '2FA Security',
      description: 'Bank-level encryption and two-factor authentication.'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Why Choose Dealcross?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Everything you need for secure online transactions
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-800"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustLevels;
