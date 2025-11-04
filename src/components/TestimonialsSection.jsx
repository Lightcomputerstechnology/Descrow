// File: src/components/TestimonialsSection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const TestimonialsSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'E-commerce Seller',
      image: '👩‍💼',
      quote: 'Dealcross has transformed how I do business online. My customers trust the escrow system and I get paid safely every time.'
    },
    {
      name: 'Michael Chen',
      role: 'Marketplace Owner',
      image: '👨‍💻',
      quote: 'Integrated Dealcross API in 2 hours. Transaction fraud dropped to zero. Best investment for our platform.'
    },
    {
      name: 'Amara Okafor',
      role: 'International Buyer',
      image: '👩',
      quote: 'Finally, a secure way to buy from overseas sellers. The delivery tracking and dispute resolution give me peace of mind.'
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors duration-300">
            See what our users are saying
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">{testimonial.image}</div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 italic transition-colors duration-300">
                "{testimonial.quote}"
              </p>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500">⭐</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
