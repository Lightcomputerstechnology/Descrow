// File: src/components/FAQPreview.jsx
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const FAQPreview = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const faqs = [
    {
      question: 'How does escrow work?',
      answer: 'When a buyer creates an escrow, their payment is held securely by Dealcross. The seller ships the item, and once the buyer confirms receipt and satisfaction, we release the payment to the seller. Simple and secure.'
    },
    {
      question: 'What are the fees?',
      answer: 'Fees are deducted immediately when the escrow is funded and range from 2-5% depending on your tier. Free tier: 5%, Basic: 3%, Pro: 2%, Enterprise: 1.5%. No hidden charges.'
    },
    {
      question: 'Is my money safe?',
      answer: 'Yes! We use bank-level encryption, 2FA, and hold funds in segregated accounts. Your money is protected until delivery is confirmed.'
    },
    {
      question: 'What payment methods do you support?',
      answer: 'We support all major payment methods: Cards (Visa, Mastercard), Bank Transfers, Mobile Money, and Cryptocurrencies (Bitcoin, Ethereum, USDT).'
    },
    {
      question: 'What if there\'s a dispute?',
      answer: 'Our dispute resolution team reviews all evidence and makes a fair decision within 24-48 hours. Both parties can submit proof.'
    },
    {
      question: 'Can I integrate Dealcross into my website?',
      answer: 'Yes! We provide a simple API for businesses to integrate escrow payments. Documentation and support included.'
    }
  ];

  return (
    <section id="faq" className="py-20 bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Everything you need to know
          </p>
        </div>

        <div ref={ref} className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.details
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300"
            >
              <summary className="flex justify-between items-center cursor-pointer p-6 font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                {faq.question}
                <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform duration-200" />
              </summary>
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 transition-colors duration-300">
                {faq.answer}
              </div>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQPreview;
