// File: src/components/FastPayouts.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const FastPayouts = () => {
  const navigate = useNavigate();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const pricing = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      features: [
        '$500 max per transaction',
        '5 transactions per month',
        'Basic support',
        'Standard processing'
      ],
      highlight: false
    },
    {
      name: 'Basic',
      price: 10,
      period: 'month',
      features: [
        '$5,000 max per transaction',
        '50 transactions per month',
        'Priority support',
        'Fast processing'
      ],
      highlight: false
    },
    {
      name: 'Pro',
      price: 50,
      period: 'month',
      features: [
        '$50,000 max per transaction',
        'Unlimited transactions',
        '24/7 Priority support',
        'Instant processing',
        'API access'
      ],
      highlight: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: [
        'Unlimited transaction amount',
        'Unlimited transactions',
        'Dedicated account manager',
        'Custom integration',
        'White-label options'
      ],
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Choose the plan that fits your business
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricing.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative p-8 rounded-2xl border-2 transition-all duration-300 ${
                plan.highlight
                  ? 'border-blue-500 shadow-2xl scale-105 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                {plan.name}
              </h3>

              <div className="mb-6">
                {typeof plan.price === 'number' ? (
                  <>
                    <span className="text-5xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">/{plan.period}</span>
                  </>
                ) : (
                  <span className="text-5xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                    {plan.price}
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/signup')}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                  plan.highlight
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FastPayouts;
