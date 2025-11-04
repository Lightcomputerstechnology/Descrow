// File: src/components/PaymentMethods.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const PaymentMethods = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const paymentMethods = [
    {
      icon: '💳',
      title: 'Credit Cards',
      description: 'Visa, Mastercard, Amex'
    },
    {
      icon: '🏦',
      title: 'Bank Transfer',
      description: 'Direct bank payments'
    },
    {
      icon: '₿',
      title: 'Cryptocurrency',
      description: 'Bitcoin, Ethereum, USDT'
    },
    {
      icon: '📱',
      title: 'Mobile Money',
      description: 'M-Pesa, Airtel Money'
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Accept All Payment Methods
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors duration-300">
            We support every way your customers want to pay
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {paymentMethods.map((method, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-950 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300"
            >
              <div className="text-5xl mb-3">{method.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
                {method.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                {method.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PaymentMethods;
